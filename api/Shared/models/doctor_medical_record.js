export function doctor_medical_record (db) {
  const sql = `
CREATE TABLE IF NOT EXISTS doctor_medical_record (
    doctor_id TEXT NOT NULL,
    medical_record_id TEXT NOT NULL,
    PRIMARY KEY (doctor_id, medical_record_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);

  `
  db.exec(sql)
}
