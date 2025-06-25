// Esta función elimina el archivo .db para resetear la base
import { closeDB, db } from '../api/Configs/conectionDb.js'
import fs from 'fs'
import env from '../api/Configs/envConfig.js'
import { generateTables } from '../api/Shared/models/index.js'

export function initializeDatabase () {
  try {
    generateTables(db) // Crear las tablas necesarias
    console.log('Base de datos inicializada ✔️')
  } catch (error) {
    console.error('Error inicializando la base de datos ❌ ', error)
  }
}

export function resetDatabase () {
  try {
    closeDB()
  } catch (err) {
    console.warn('Advertencia cerrando DB:', err.message)
  }

  try {
    if (fs.existsSync(env.dbPath)) {
      fs.unlinkSync(env.dbPath)
      console.log('Base de datos eliminada para reset')
    }
  } catch (err) {
    console.error('Error eliminando la base de datos ❌', err)
  }
}

beforeAll(() => {
  initializeDatabase()
})

afterAll(() => {
  resetDatabase()
  closeDB()
  console.log('DB cerrada')
})
