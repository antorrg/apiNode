import path from 'path'
import env from './envConfig.js'

describe('Test de entorno y base de datos', () => {
  describe('Variables de entorno', () => {
    it('deberia inicializar en el entorno correcto, con la base de datos correcta.', () => {
      console.log(env.dbPath)
      path.parse(env.dbPath).name
      const envInfo = `Aplicacion inicializad en entorno de ${env.Status}, base de datos llamada: ${path.parse(env.dbPath).name}`
      expect(envInfo).toBe('Aplicacion inicializad en entorno de test, base de datos llamada: pruebas')
    })
  })
})
