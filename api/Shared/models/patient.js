export function patient (db) {
  const sql = `
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    dni TEXT UNIQUE,
    age INTEGER NOT NULL,
    email TEXT,
    address TEXT,
    phone TEXT,
    development_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
);

  `
  db.exec(sql)
}
