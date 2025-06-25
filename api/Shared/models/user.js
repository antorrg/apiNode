export function user (db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nickname TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    dni INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
);
  `
  db.exec(sql)
}
