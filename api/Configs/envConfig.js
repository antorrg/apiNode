import dotenv from 'dotenv'
import path from 'path'

const configEnv = {
  test: '.env.test',
  development: '.env.development',
  production: '.env'
}
const envFile = configEnv[process.env.NODE_ENV]
dotenv.config({ path: envFile })
const {
  DB_NAME
} = process.env

const dbPath = path.join(path.resolve('database'), `${DB_NAME}.db`)

export default {
  dbPath,
  Status: process.env.NODE_ENV
}
