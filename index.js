import env from './api/Configs/envConfig.js'
import { db } from './api/Configs/conectionDb.js'
import { generateTables } from './api/Shared/models/index.js'

console.log('estamos en: ', env.Status)
console.log('Con base de datos: ', env.dbPath)
generateTables(db)
