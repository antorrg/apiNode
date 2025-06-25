export function treatments (db) {
  const sql = `
CREATE TABLE IF NOT EXISTS treatments (
    id TEXT PRIMARY KEY,
    medical_record_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    medication_id TEXT,
    praxis_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id),
    FOREIGN KEY (praxis_id) REFERENCES praxes(id)
);

  `
  db.exec(sql)
}
