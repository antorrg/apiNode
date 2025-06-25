import Database from 'better-sqlite3'
import env from './envConfig.js'

// export const db = new Database(env.dbPath)

let dbInstance

export function getDB () {
  if (!dbInstance) {
    dbInstance = new Database(env.dbPath)
  }
  return dbInstance
}

export function closeDB () {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
export const db = getDB()
