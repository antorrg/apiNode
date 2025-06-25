export function praxes (db) {
  const sql = `
CREATE TABLE IF NOT EXISTS praxes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
);

  `
  db.exec(sql)
}
