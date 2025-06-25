export function evolution_notes (db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS evolution_notes (
    id TEXT PRIMARY KEY,
    treatment_id TEXT NOT NULL,
    entry TEXT NOT NULL,
    updated_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);

  `
  db.exec(sql)
}
