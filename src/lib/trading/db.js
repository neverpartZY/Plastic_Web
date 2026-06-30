/**
 * JSON-based data store — drop-in replacement for better-sqlite3.
 * Same API (prepare/run/get/all), pure Node.js, no compilation needed.
 */
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function now() { return new Date().toISOString().replace('T', ' ').slice(0, 19); }

class JSONDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.tables = { users: [], listings: [], matches: [], prices: [] };
    this.autoIncrement = { users: 1, listings: 1, matches: 1, prices: 1 };
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
        this.tables = { users: [], listings: [], matches: [], prices: [], ...data.tables };
        this.autoIncrement = { users: 1, listings: 1, matches: 1, prices: 1, ...data.autoIncrement };
        console.log(`[DB] Loaded ${this._totalCount()} records from ${this.dbPath}`);
      } else {
        this._save();
        this._seed();
      }
    } catch (e) {
      console.error('[DB] Load error, starting fresh:', e.message);
      this._save();
      this._seed();
    }
  }

  _totalCount() {
    return Object.values(this.tables).reduce((s, t) => s + t.length, 0);
  }

  _save() {
    fs.writeFileSync(this.dbPath, JSON.stringify({
      tables: this.tables,
      autoIncrement: this.autoIncrement,
    }, null, 2));
  }

  _seed() {
    if (this.tables.prices.length === 0) {
      const seedPrices = [
        { category: 'PET', material: 'PET三色瓶砖', price_avg: 5800, price_low: 5600, price_high: 6200, trend: 'up', change_pct: 2.7, updated_at: now() },
        { category: 'PP', material: 'PP白色粉碎料', price_avg: 6200, price_low: 5800, price_high: 6500, trend: 'down', change_pct: -1.2, updated_at: now() },
        { category: 'PP', material: 'PP注塑级再生颗粒', price_avg: 6800, price_low: 6500, price_high: 7200, trend: 'flat', change_pct: 0, updated_at: now() },
        { category: 'HDPE', material: 'HDPE小中空破碎', price_avg: 5600, price_low: 5300, price_high: 5800, trend: 'flat', change_pct: 0, updated_at: now() },
        { category: 'HDPE', material: 'HDPE管道级颗粒', price_avg: 8200, price_low: 7800, price_high: 8600, trend: 'up', change_pct: 0.8, updated_at: now() },
        { category: 'LDPE', material: 'LDPE大棚膜颗粒', price_avg: 6300, price_low: 5800, price_high: 6800, trend: 'down', change_pct: -2.1, updated_at: now() },
        { category: 'ABS', material: 'ABS灰白破碎料', price_avg: 8900, price_low: 8200, price_high: 9600, trend: 'up', change_pct: 3.1, updated_at: now() },
        { category: 'PC', material: 'PC车灯破碎', price_avg: 9200, price_low: 8500, price_high: 10000, trend: 'flat', change_pct: 0, updated_at: now() },
      ];
      let id = 1;
      for (const p of seedPrices) { p.id = id++; }
      this.tables.prices = seedPrices;
      this.autoIncrement.prices = seedPrices.length + 1;
      console.log('[DB] Seeded 8 price records');
    }
    this._save();
  }

  // ── Statement object ────────────────────────────────────────
  _parseSql(sql) {
    // Very simple SQL parser for the patterns used in routes
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith('INSERT')) return { type: 'INSERT', sql, table: this._extractTable(upper, 'INSERT INTO') };
    if (upper.startsWith('SELECT')) return { type: 'SELECT', sql, table: this._extractTable(upper, 'FROM'), where: this._extractWhere(sql) };
    if (upper.startsWith('UPDATE')) return { type: 'UPDATE', sql, table: this._extractTable(upper, 'UPDATE'), where: this._extractWhere(sql) };
    if (upper.startsWith('DELETE')) return { type: 'DELETE', sql, table: this._extractTable(upper, 'FROM'), where: this._extractWhere(sql) };
    return { type: 'UNKNOWN', sql };
  }

  _extractTable(upper, keyword) {
    const idx = upper.indexOf(keyword);
    if (idx < 0) return '';
    const rest = upper.slice(idx + keyword.length).trim();
    return rest.split(/[ ,(;]/)[0].toLowerCase();
  }

  _extractWhere(sql) {
    const idx = sql.toUpperCase().indexOf('WHERE');
    if (idx < 0) return null;
    return sql.slice(idx + 5).trim();
  }

  // Extract column names from INSERT INTO tbl (col1, col2, ...) VALUES (...)
  _extractInsertCols(sql) {
    const upper = sql.toUpperCase();
    const lp = upper.indexOf('(');
    const rp = upper.indexOf(')');
    if (lp < 0 || rp < 0) return [];
    const colsStr = sql.slice(lp + 1, rp);
    return colsStr.split(',').map(c => c.trim().toLowerCase());
  }

  _matchesRow(row, whereClause, params) {
    if (!whereClause) return true;
    // Simple: replace ? placeholders and eval
    let clause = whereClause;
    let pi = 0;
    clause = clause.replace(/\?/g, () => {
      const val = params[pi++];
      return typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val;
    });
    // Replace column names with row[column]
    const cols = Object.keys(row);
    for (const col of cols) {
      clause = clause.replace(new RegExp(`\\b${col}\\b`, 'gi'), `row['${col}']`);
    }
    try {
      // eslint-disable-next-line no-new-func
      return new Function('row', `return (${clause})`)(row);
    } catch {
      return true; // safe fallback
    }
  }

  prepare(sql) {
    const parsed = this._parseSql(sql);
    const db = this;

    return {
      run(...params) {
        const table = parsed.table;
        if (parsed.type === 'INSERT') {
          const id = db.autoIncrement[table] || 1;
          // Extract column names from the SQL itself, not a hardcoded list
          const cols = db._extractInsertCols(sql);
          const row = { id };
          for (let i = 0; i < params.length && i < cols.length; i++) {
            row[cols[i]] = params[i];
          }
          if (sql.toUpperCase().includes('CREATED_AT')) {
            row.created_at = row.created_at || now();
          }
          if (sql.toUpperCase().includes('UPDATED_AT')) {
            row.updated_at = row.updated_at || now();
          }
          db.tables[table].push(row);
          db.autoIncrement[table] = id + 1;
          db._save();
          return { lastInsertRowid: id, changes: 1 };
        }
        if (parsed.type === 'UPDATE') {
          // Simple UPDATE: first param values are SET columns
          let count = 0;
          for (const row of db.tables[table]) {
            if (db._matchesRow(row, parsed.where, params.slice(-(params.length) || 0))) {
              // Apply updates — naive: look for column=value patterns in SET clause
              const setPart = sql.slice(sql.toUpperCase().indexOf('SET') + 3, sql.toUpperCase().indexOf('WHERE')).trim();
              const pairs = setPart.split(',');
              for (let i = 0; i < pairs.length; i++) {
                const [col, _] = pairs[i].trim().split(/\s*=\s*/);
                const cleanCol = col.trim().toLowerCase();
                if (row.hasOwnProperty(cleanCol) && params[i] !== undefined) {
                  row[cleanCol] = params[i];
                }
              }
              if (sql.toUpperCase().includes('UPDATED_AT')) {
                row.updated_at = now();
              }
              count++;
            }
          }
          if (count > 0) db._save();
          return { changes: count };
        }
        return { changes: 0 };
      },

      get(...params) {
        if (parsed.type === 'SELECT') {
          if (sql.toUpperCase().includes('COUNT(*)')) {
            return { cnt: db.tables[parsed.table] ? db.tables[parsed.table].length : 0 };
          }
          for (const row of db.tables[parsed.table]) {
            if (db._matchesRow(row, parsed.where, params)) return row;
          }
        }
        return undefined;
      },

      all(...params) {
        if (parsed.type === 'SELECT') {
          return db.tables[parsed.table].filter(row =>
            db._matchesRow(row, parsed.where, params)
          );
        }
        return [];
      },
    };
  }

  exec(_sql) { /* no-op — schema managed in memory */ }
  pragma(_p) { /* no-op */ }
  transaction(fn) { return fn; }
}

const DB_PATH = path.join(DATA_DIR, 'zaisutong.db');
const db = new JSONDatabase(DB_PATH);

module.exports = db;
