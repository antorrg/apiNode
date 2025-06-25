import { getId, setId } from '../../test/helpers/storeId.js'
import { GenericCRUD } from './GenericCrud.js'

const crud = new GenericCRUD('users')

describe('Clase GenericCRUD', () => {
  const userData = {
    nickname: 'pepe',
    full_name: 'jose ejemplo',
    email: 'pepe@ejemplo.com',
    password: '123456',
    dni: 22
  }

  describe('método create', () => {
    it('debería crear un usuario y devolver un ID válido', () => {
      const id = crud.create(userData)
      expect(id).toEqual(expect.any(String))
      setId(id)
    })
  })

  describe('método findAll', () => {
    it('debería obtener un array de usuarios', () => {
      const id = getId()
      const result = crud.findAll()
      expect(result).not.toBeNull()
      expect(result).toMatchObject([{ ...userData, id }])
    })
  })

  describe('método findByPk', () => {
    it('debería obtener el usuario por su ID', () => {
      const id = getId()
      const result = crud.findByPk(id)

      expect(result).not.toBeNull()
      expect(result).toMatchObject({ ...userData, id })
    })
  })

  describe('método findOne', () => {
    it('debería buscar un usuario por su email', () => {
      const result = crud.findOne('email', userData.email)

      expect(result).not.toBeNull()
      expect(result.email).toBe(userData.email)
    })

    it('debería devolver null si no existe el registro', () => {
      const result = crud.findOne('email', 'inexistente@correo.com')

      expect(result).toBeNull()
    })
  })
  describe('método update', () => {
    it('debería actualizar campos del usuario', () => {
      const id = getId()
      const updates = {
        full_name: 'José Actualizado',
        dni: 33
      }

      crud.update(id, updates)

      const updated = crud.findByPk(id)

      expect(updated).not.toBeNull()
      expect(updated.full_name).toBe('José Actualizado')
      expect(updated.dni).toBe(33)
    })
  })

  describe('método delete', () => {
    it('debería eliminar el usuario', () => {
      const id = getId()

      crud.delete(id)

      const result = crud.findByPk(id)

      expect(result).toBeNull()
    })
  })
})
