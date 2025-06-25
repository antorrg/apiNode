export function doctor_treatment (db) {
  const sql = `
CREATE TABLE IF NOT EXISTS doctor_treatment (
    doctor_id TEXT NOT NULL,
    treatment_id TEXT NOT NULL,
    PRIMARY KEY (doctor_id, treatment_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);

  `
  db.exec(sql)
}
