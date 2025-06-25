export function doctor (db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    phone TEXT,
    speciality TEXT,
    license TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

  `
  db.exec(sql)
}
