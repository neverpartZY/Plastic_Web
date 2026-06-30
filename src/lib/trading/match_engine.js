/**
 * 5-dimension match engine for 再塑通 platform.
 *
 * Scoring dimensions (total 100 points):
 *  1. Category match   – 50 pts (exact match required)
 *  2. Form compatibility – 15 pts
 *  3. Location proximity – 15 pts
 *  4. Price compatibility – 10 pts
 *  5. Quantity compatibility – 10 pts
 */

// ---- Helpers ----------------------------------------------------------------

const FORM_COMPAT_MAP = {
  // waste form -> compatible recycled forms
  '瓶砖':     ['瓶片', '碎片', '颗粒'],
  '瓶片':     ['瓶片', '碎片', '颗粒'],
  '破碎料':   ['破碎料', '颗粒'],
  '粉碎料':   ['粉碎料', '颗粒'],
  '碎片':     ['碎片', '颗粒'],
  '颗粒':     ['颗粒'],
  '膜':       ['膜颗粒', '颗粒'],
  '块料':     ['破碎料', '颗粒'],
  '扎装':     ['瓶砖', '瓶片', '颗粒'],
  '吨包':     ['颗粒', '破碎料'],
  '毛料':     ['破碎料', '颗粒'],
  '废丝':     ['颗粒'],
  '板材':     ['破碎料', '颗粒'],
  '管材':     ['破碎料', '颗粒'],
  '破碎':     ['破碎料', '颗粒'],
  '车灯破碎': ['破碎料', '颗粒'],
};

// Adjacent province map (simplified)
const ADJACENT_MAP = {
  '河北': ['北京','天津','山西','河南','山东','辽宁','内蒙古'],
  '北京': ['河北','天津'],
  '天津': ['北京','河北'],
  '山西': ['河北','河南','陕西','内蒙古'],
  '河南': ['河北','山西','山东','安徽','湖北','陕西'],
  '山东': ['河北','河南','江苏','安徽'],
  '江苏': ['山东','安徽','浙江','上海'],
  '浙江': ['江苏','上海','安徽','江西','福建'],
  '上海': ['江苏','浙江'],
  '安徽': ['河南','山东','江苏','浙江','江西','湖北'],
  '湖北': ['河南','安徽','江西','湖南','重庆','陕西'],
  '广东': ['福建','江西','湖南','广西','海南'],
  '福建': ['浙江','江西','广东'],
  '江西': ['浙江','安徽','湖北','湖南','广东','福建'],
  '湖南': ['湖北','江西','广东','广西','贵州','重庆'],
  '辽宁': ['河北','吉林','内蒙古'],
  '四川': ['重庆','贵州','云南','西藏','陕西','甘肃','青海'],
  '重庆': ['四川','贵州','湖南','湖北','陕西'],
  '陕西': ['山西','河南','湖北','四川','甘肃','宁夏','内蒙古','重庆'],
  '内蒙古': ['河北','山西','辽宁','吉林','黑龙江','陕西','甘肃','宁夏'],
};

// Canonical category names
function normalizeCategory(raw) {
  if (!raw) return '';
  const c = raw.toUpperCase().trim();
  if (c.includes('PET')) return 'PET';
  if (c.includes('PP') && !c.includes('ABS')) return 'PP';
  if (c.includes('HDPE') || c.includes('HD PE')) return 'HDPE';
  if (c.includes('LDPE') || c.includes('LD PE')) return 'LDPE';
  if (c.includes('ABS')) return 'ABS';
  if (c.includes('PC')) return 'PC';
  if (c.includes('PVC')) return 'PVC';
  if (c.includes('PE') && !c.includes('PET') && !c.includes('HDPE') && !c.includes('LDPE')) return 'PE';
  if (c.includes('PS')) return 'PS';
  return c;
}

// ---- Dimension scorers ------------------------------------------------------

function scoreCategory(supply, demand) {
  const sCat = normalizeCategory(supply.material);
  const dCat = normalizeCategory(demand.material);
  return sCat === dCat && sCat !== '' ? 50 : 0;
}

function scoreForm(supply, demand) {
  // supply side is the waste/recycled form; demand side specifies desired form
  const sForm = (supply.form || '').trim();
  const dForm = (demand.form || '').trim();
  if (!sForm || !dForm) return 5; // unspecified → partial credit

  const compatible = FORM_COMPAT_MAP[sForm];
  if (!compatible) return 5;

  // Check if demand form is directly in the compatible list
  for (const c of compatible) {
    if (dForm.includes(c) || c.includes(dForm)) return 15;
  }
  return 5;
}

function scoreLocation(supply, demand) {
  const sLoc = (supply.location || '').trim();
  const dLoc = (demand.location || '').trim();
  if (!sLoc || !dLoc) return 5;

  // Extract province (first 2 characters usually)
  const extractProvince = (loc) => {
    for (const p of Object.keys(ADJACENT_MAP)) {
      if (loc.startsWith(p)) return p;
    }
    return loc.substring(0, 2);
  };

  const sProv = extractProvince(sLoc);
  const dProv = extractProvince(dLoc);

  if (sProv === dProv) return 15;
  if (ADJACENT_MAP[sProv] && ADJACENT_MAP[sProv].includes(dProv)) return 10;
  return 5;
}

function scorePrice(supply, demand) {
  const sPrice = supply.price || 0;
  const dPrice = demand.price || 0;
  if (sPrice <= 0 || dPrice <= 0) return 5; // price not set

  // Demand is buying: they have a budget. Supply is selling: they have an asking price.
  // Good match when supply price ≤ demand budget.
  if (sPrice <= dPrice) return 10;
  // Slightly over budget — partial
  const ratio = dPrice / sPrice;
  if (ratio >= 0.85) return 7;
  if (ratio >= 0.70) return 4;
  return 1;
}

function scoreQuantity(supply, demand) {
  const sQty = supply.quantity || 0;
  const dQty = demand.quantity || 0;
  if (sQty <= 0 || dQty <= 0) return 5;

  const ratio = Math.min(sQty, dQty) / Math.max(sQty, dQty);
  if (ratio >= 0.8) return 10;
  if (ratio >= 0.5) return 7;
  if (ratio >= 0.3) return 4;
  return 2;
}

// ---- Main engine ------------------------------------------------------------

/**
 * Compute match scores between a given listing and a list of candidate listings.
 *
 * @param {Object} source   - The listing to match against (the one just created)
 * @param {Array}  candidates - Array of opposite-type listings
 * @param {number} limit    - Max matches to return
 * @returns {Array} sorted matches with score and dimension breakdown
 */
/**
 * Compute match score for a single supply-demand pair.
 * Returns { score, dimensions } or null when categories don't match.
 */
function computeMatchScore(supply, demand) {
  const dimCategory = scoreCategory(supply, demand);
  if (dimCategory === 0) return null; // category must match

  const dimForm = scoreForm(supply, demand);
  const dimLocation = scoreLocation(supply, demand);
  const dimPrice = scorePrice(supply, demand);
  const dimQuantity = scoreQuantity(supply, demand);

  const score = dimCategory + dimForm + dimLocation + dimPrice + dimQuantity;
  return {
    score,
    dimensions: {
      category: dimCategory,
      form: dimForm,
      location: dimLocation,
      price: dimPrice,
      quantity: dimQuantity,
    },
  };
}

/**
 * Compute match scores between a given listing and a list of candidate listings.
 *
 * @param {Object} source   - The listing to match against (the one just created)
 * @param {Array}  candidates - Array of opposite-type listings
 * @param {number} limit    - Max matches to return
 * @returns {Array} sorted matches with score and dimension breakdown
 */
function computeMatches(source, candidates, limit = 10) {
  const results = [];

  for (const candidate of candidates) {
    const supply = source.type === 'supply' ? source : candidate;
    const demand = source.type === 'supply' ? candidate : source;

    const result = computeMatchScore(supply, demand);
    if (!result) continue; // must match category

    results.push({
      supplyId: supply.id,
      demandId: demand.id,
      score: result.score,
      dimensionScores: result.dimensions,
    });
  }

  // Sort by score descending, cap at limit
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Fix 15: Recompute all matches for a single listing after it has been updated.
 * The caller is expected to have already deleted stale matches involving this
 * listing. Re-evaluates the listing against every active opposite-type listing
 * and persists any match scoring >= 50 (i.e. category match achieved).
 */
function recomputeMatchesForListing(db, listingId) {
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
  if (!listing || listing.status !== 'active') return;

  const oppositeType = listing.type === 'supply' ? 'demand' : 'supply';
  const candidates = db
    .prepare('SELECT * FROM listings WHERE type = ? AND status = ? AND id != ?')
    .all(oppositeType, 'active', listingId);

  const insertMatch = db.prepare(
    `INSERT INTO matches (supply_id, demand_id, score, dimension_scores, status) VALUES (?, ?, ?, ?, 'pending')`
  );
  const findExisting = db.prepare(
    'SELECT id FROM matches WHERE supply_id = ? AND demand_id = ?'
  );

  for (const candidate of candidates) {
    const supply = listing.type === 'supply' ? listing : candidate;
    const demand = listing.type === 'demand' ? listing : candidate;
    const result = computeMatchScore(supply, demand);
    if (result && result.score >= 50) {
      if (!findExisting.get(supply.id, demand.id)) {
        insertMatch.run(supply.id, demand.id, result.score, JSON.stringify(result.dimensions));
      }
    }
  }
}

module.exports = { computeMatches, computeMatchScore, recomputeMatchesForListing, normalizeCategory };
