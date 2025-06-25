import { doctor } from './doctor.js'
import { evolution_notes } from './evolution_notes.js'
import { medical_records } from './medical_records.js'
import { medications } from './medications.js'
import { patient } from './patient.js'
import { praxes } from './praxes.js'
import { treatments } from './treatments.js'
import { user } from './user.js'
import { doctor_medical_record } from './doctor_medical_record.js'
import { doctor_treatment } from './doctor_treatement.js'

export const generateTables = (db) => {
  try {
    doctor(db)
    evolution_notes(db)
    medical_records(db)
    medications(db)
    patient(db)
    praxes(db)
    treatments(db)
    user(db)
    doctor_medical_record(db)
    doctor_treatment(db)
    console.log('Tablas creadas exitosamente')
  } catch (error) {
    console.error('Error creando las tablas', error)
  }
}
