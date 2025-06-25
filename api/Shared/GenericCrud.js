import { db } from '../Configs/conectionDb.js' // Tu conexión a better-sqlite3
import { randomUUID } from 'crypto'

export class GenericCRUD {
  /**
     * @param {string} table Nombre de la tabla
     * @param {string} idColumn Nombre de la columna clave primaria
     * @param {string} field Nombre de campo unico
     * @param {boolean} useUUID Si se debe generar el ID automáticamente
     */
  constructor (table, idColumn = 'id', useUUID = true) {
    this.table = table
    this.idColumn = idColumn
    this.useUUID = useUUID
  }

  /**
     * Inserta un registro
     * @param {Object} data Objeto con los campos de la tabla
     * @returns {string} ID generado o proporcionado
     */
  create (data) {
    const columns = Object.keys(data)
    const values = Object.values(data)

    let id = data[this.idColumn]

    if (this.useUUID && !id) {
      id = randomUUID()
      console.log('id: ', id)
      columns.push(this.idColumn)
      values.push(id)
    }
    const placeholders = columns.map(() => '?').join(', ')
    console.log('col', columns)

    const stmt = db.prepare(`
            INSERT INTO ${this.table} (${columns.join(', ')})
            VALUES (${placeholders})
        `)
    stmt.run(...values)
    return id
  }

  /**
     * Obtiene un registro por ID
     * @param {string} id
     * @returns {Object|null}
     */
  findByPk (id) {
    const stmt = db.prepare(`SELECT * FROM ${this.table} WHERE ${this.idColumn} = ?`)
    return stmt.get(id) || null
  }

  /**
   * Busca un registro por cualquier campo
   * @param {string} field Nombre de la columna
   * @param {string} value Valor a buscar
   * @returns {Object|null}
   */
  findOne (field, value) {
    const stmt = db.prepare(`SELECT * FROM ${this.table} WHERE ${field} = ?`)
    return stmt.get(value) || null
  }

  /**
     * Lista todos los registros
     * @returns {Array}
     */
  findAll () {
    const stmt = db.prepare(`SELECT * FROM ${this.table}`)
    return stmt.all()
  }

  /**
     * Actualiza un registro
     * @param {string} id
     * @param {Object} data Campos a actualizar
     */
  update (id, data) {
    const columns = Object.keys(data)
    const values = Object.values(data)

    if (columns.length === 0) return

    const setClause = columns.map(col => `${col} = ?`).join(', ')
    const stmt = db.prepare(`
            UPDATE ${this.table}
            SET ${setClause}
            WHERE ${this.idColumn} = ?
        `)
    stmt.run(...values, id)
  }

  /**
     * Elimina un registro
     * @param {string} id
     */
  delete (id) {
    const stmt = db.prepare(`DELETE FROM ${this.table} WHERE ${this.idColumn} = ?`)
    stmt.run(id)
  }
}
