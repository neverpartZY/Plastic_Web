const express = require('express');
const router = express.Router();
const db = require('../db');
const { computeMatches } = require('../match_engine');
const {
  sanitizeObject,
  findSQLInjection,
  checkLengthLimits,
  MAX_PRICE,
  MAX_QUANTITY,
  VALID_LISTING_STATUSES,
} = require('../helpers');

// POST /api/listings — create a new listing + auto-match
router.post('/', (req, res) => {
  try {
    const {
      userId, type, wasteOrRecycled, material,
      form, quantity, price, location, specs, notes,
    } = req.body;

    if (!userId || !type || !wasteOrRecycled || !material) {
      return res.status(400).json({
        success: false,
        error: 'userId, type, wasteOrRecycled, and material are required',
      });
    }

    if (!['supply', 'demand'].includes(type)) {
      return res.status(400).json({ success: false, error: 'type must be supply or demand' });
    }

    if (!['废塑料', '再生料'].includes(wasteOrRecycled)) {
      return res.status(400).json({
        success: false,
        error: 'wasteOrRecycled must be 废塑料 or 再生料',
      });
    }

    // Fix 1: type validation for quantity/price (null price allowed → negotiable)
    if (quantity !== undefined && quantity !== null && typeof quantity !== 'number') {
      return res.status(400).json({ success: false, error: 'quantity must be a number' });
    }
    if (price !== undefined && price !== null && typeof price !== 'number') {
      return res.status(400).json({ success: false, error: 'price must be a number' });
    }

    // Fix 2: negative price rejected
    if (price !== undefined && price !== null && price < 0) {
      return res.status(400).json({ success: false, error: 'price must not be negative' });
    }

    // Fix 1: reject negative/zero quantity
    if (quantity !== undefined && quantity <= 0) {
      return res.status(400).json({ success: false, error: 'quantity must be positive' });
    }

    // Fix 6: price/quantity bounds
    if (price !== undefined && price > MAX_PRICE) {
      return res.status(400).json({
        success: false,
        error: `price must not exceed ${MAX_PRICE}`,
      });
    }
    if (quantity !== undefined && quantity > MAX_QUANTITY) {
      return res.status(400).json({
        success: false,
        error: `quantity must not exceed ${MAX_QUANTITY}`,
      });
    }

    // Fix 5: SQL injection check
    const dangerousField = findSQLInjection(req.body);
    if (dangerousField) {
      return res.status(400).json({ success: false, error: 'invalid characters in input' });
    }

    // Fix 4: XSS sanitization
    sanitizeObject(req.body);

    // Fix 7: length limits
    const lengthErr = checkLengthLimits(req.body);
    if (lengthErr) {
      return res.status(400).json({
        success: false,
        error: `${lengthErr.field} must not exceed ${lengthErr.limit} characters`,
      });
    }

    // Verify user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Fix 7: price:null handling — null/undefined → negotiable; 0 → negotiable; else fixed
    let finalPrice, priceNegotiable;
    if (price === null) {
      finalPrice = 0;
      priceNegotiable = 1;
    } else if (price === undefined) {
      finalPrice = 0;
      priceNegotiable = 1;
    } else {
      finalPrice = price;
      priceNegotiable = price === 0 ? 1 : 0;
    }

    const result = db.prepare(`
      INSERT INTO listings (user_id, type, waste_or_recycled, material, form, quantity, price, price_negotiable, location, specs, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, type, req.body.wasteOrRecycled, req.body.material,
      req.body.form || '', quantity !== undefined ? quantity : 0, finalPrice, priceNegotiable,
      req.body.location || '', req.body.specs || '', req.body.notes || '',
    );

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);

    // Auto-match: find opposite-type active listings
    const oppositeType = type === 'supply' ? 'demand' : 'supply';
    const candidates = db.prepare(
      `SELECT * FROM listings WHERE type = ? AND status = 'active' AND id != ?`
    ).all(oppositeType, listing.id);

    let matches = [];
    if (candidates.length > 0) {
      const matchResults = computeMatches(listing, candidates, 10);

      // Persist top matches
      const insertMatch = db.prepare(`
        INSERT INTO matches (supply_id, demand_id, score, dimension_scores, status)
        VALUES (?, ?, ?, ?, 'pending')
      `);

      const persistMatches = db.transaction((items) => {
        const saved = [];
        for (const m of matchResults) {
          const dimJson = JSON.stringify(m.dimensionScores);
          const existing = db.prepare(
            'SELECT id FROM matches WHERE supply_id = ? AND demand_id = ?'
          ).get(m.supplyId, m.demandId);

          if (!existing) {
            const r = insertMatch.run(m.supplyId, m.demandId, m.score, dimJson);
            saved.push({
              id: r.lastInsertRowid,
              supplyId: m.supplyId,
              demandId: m.demandId,
              score: m.score,
              dimensionScores: m.dimensionScores,
              status: 'pending',
            });
          } else {
            saved.push({ id: existing.id, ...m, status: 'pending' });
          }
        }
        return saved;
      });

      matches = persistMatches(matchResults);
    }

    res.status(201).json({ success: true, listing, matches });
  } catch (err) {
    console.error('[listings] create error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings — query listings with optional filters + pagination
router.get('/', (req, res) => {
  try {
    const { type, material, location, status, userId, wasteOrRecycled } = req.query;

    // Fix 12: pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM listings WHERE 1=1';
    let countSql = 'SELECT COUNT(*) AS total FROM listings WHERE 1=1';
    const params = [];

    if (type) { sql += ' AND type = ?'; countSql += ' AND type = ?'; params.push(type); }
    if (material) { sql += ' AND material LIKE ?'; countSql += ' AND material LIKE ?'; params.push(`%${material}%`); }
    if (location) { sql += ' AND location LIKE ?'; countSql += ' AND location LIKE ?'; params.push(`%${location}%`); }
    if (status) { sql += ' AND status = ?'; countSql += ' AND status = ?'; params.push(status); }
    if (userId) { sql += ' AND user_id = ?'; countSql += ' AND user_id = ?'; params.push(Number(userId)); }
    if (wasteOrRecycled) { sql += ' AND waste_or_recycled = ?'; countSql += ' AND waste_or_recycled = ?'; params.push(wasteOrRecycled); }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.total : 0;

    const listings = db.prepare(sql).all(...params, limit, offset);
    res.json({ success: true, listings, total, page, limit });
  } catch (err) {
    console.error('[listings] query error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings/:id — single listing with user info
router.get('/:id', (req, res) => {
  try {
    const listing = db.prepare(`
      SELECT l.*, u.name AS user_name, u.role AS user_role, u.location AS user_location
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    res.json({ success: true, listing });
  } catch (err) {
    console.error('[listings] get error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/listings/:id — update listing
router.patch('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Fix 9: ownership check — if _userId supplied it must match the listing owner
    if (req.body._userId && existing.user_id !== req.body._userId) {
      console.warn(`[listings] PATCH auth denied: user ${req.body._userId} -> listing ${req.params.id} (owner ${existing.user_id})`);
      return res.status(403).json({ success: false, error: 'Not authorized to modify this listing' });
    }

    // validate status if provided
    if (req.body.status !== undefined) {
      if (!VALID_LISTING_STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          error: `status must be one of: ${VALID_LISTING_STATUSES.join(', ')}`,
        });
      }
    }

    // Fix 6: enum validation for type
    if (req.body.type !== undefined && !['supply', 'demand'].includes(req.body.type)) {
      return res.status(400).json({ success: false, error: 'type must be supply or demand' });
    }

    // Fix 6 + Fix 11: enum validation for waste_or_recycled (accept camelCase & snake_case)
    const wasteOrRecycledValue =
      req.body.wasteOrRecycled !== undefined ? req.body.wasteOrRecycled : req.body.waste_or_recycled;
    if (wasteOrRecycledValue !== undefined && !['废塑料', '再生料'].includes(wasteOrRecycledValue)) {
      return res.status(400).json({ success: false, error: 'wasteOrRecycled must be 废塑料 or 再生料' });
    }

    // Fix 1: type checks for quantity/price (null price allowed → negotiable)
    if (req.body.quantity !== undefined && req.body.quantity !== null && typeof req.body.quantity !== 'number') {
      return res.status(400).json({ success: false, error: 'quantity must be a number' });
    }
    if (req.body.price !== undefined && req.body.price !== null && typeof req.body.price !== 'number') {
      return res.status(400).json({ success: false, error: 'price must be a number' });
    }

    // Fix 2: negative price rejected
    if (req.body.price !== undefined && req.body.price !== null && req.body.price < 0) {
      return res.status(400).json({ success: false, error: 'price must not be negative' });
    }

    // price/quantity bounds
    if (req.body.price !== undefined && req.body.price !== null && req.body.price > MAX_PRICE) {
      return res.status(400).json({
        success: false,
        error: `price must not exceed ${MAX_PRICE}`,
      });
    }
    if (req.body.quantity !== undefined && req.body.quantity !== null) {
      if (req.body.quantity <= 0) {
        return res.status(400).json({ success: false, error: 'quantity must be positive' });
      }
      if (req.body.quantity > MAX_QUANTITY) {
        return res.status(400).json({
          success: false,
          error: `quantity must not exceed ${MAX_QUANTITY}`,
        });
      }
    }

    // SQL injection check
    const dangerousField = findSQLInjection(req.body);
    if (dangerousField) {
      return res.status(400).json({ success: false, error: 'invalid characters in input' });
    }

    // XSS sanitization
    sanitizeObject(req.body);

    // Fix 12: non-empty validation for material
    if (req.body.material !== undefined && typeof req.body.material === 'string' && req.body.material.trim() === '') {
      return res.status(400).json({ success: false, error: 'material cannot be empty' });
    }

    // length limits
    const lengthErr = checkLengthLimits(req.body);
    if (lengthErr) {
      return res.status(400).json({
        success: false,
        error: `${lengthErr.field} must not exceed ${lengthErr.limit} characters`,
      });
    }

    const updates = [];
    const params = [];

    // simple scalar fields
    const simpleFields = ['status', 'quantity', 'price', 'location', 'specs', 'notes', 'material', 'form'];
    for (const field of simpleFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    // Fix 11: waste_or_recycled — accept both camelCase and snake_case
    const wasteOrRecycled =
      req.body.wasteOrRecycled !== undefined ? req.body.wasteOrRecycled : req.body.waste_or_recycled;
    if (wasteOrRecycled !== undefined) {
      updates.push('waste_or_recycled = ?');
      params.push(wasteOrRecycled);
    }

    // Fix 5: when price is updated, recompute price_negotiable
    if (req.body.price !== undefined && req.body.price !== null) {
      updates.push('price_negotiable = ?');
      params.push(req.body.price === 0 ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    // Fix 10: recompute matches if any match-relevant field changed
    const changedFields = ['material', 'price', 'quantity', 'location', 'form'];
    if (changedFields.some((f) => req.body[f] !== undefined)) {
      db.prepare('DELETE FROM matches WHERE supply_id = ? OR demand_id = ?').run(req.params.id, req.params.id);
      const matchEngine = require('../match_engine');
      matchEngine.recomputeMatchesForListing(db, parseInt(req.params.id, 10));
    }

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    res.json({ success: true, listing });
  } catch (err) {
    console.error('[listings] update error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
