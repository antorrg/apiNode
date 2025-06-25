import DataSanitizer from './DataSanitizer.js'

describe('DataSanitizer', () => {
  let sanitizer

  beforeEach(() => {
    sanitizer = new DataSanitizer()
  })

  describe('Constructor y configuración', () => {
    test('debería crear instancia con opciones por defecto', () => {
      expect(sanitizer).toBeInstanceOf(DataSanitizer)
      expect(sanitizer.options.maxLength).toBe(1000)
      expect(sanitizer.options.allowBasicHtml).toBe(false)
    })

    test('debería aceptar opciones personalizadas', () => {
      const customSanitizer = new DataSanitizer({
        maxLength: 500,
        allowBasicHtml: true
      })

      expect(customSanitizer.options.maxLength).toBe(500)
      expect(customSanitizer.options.allowBasicHtml).toBe(true)
    })
  })

  describe('sanitizeString', () => {
    test('debería escapar caracteres SQL peligrosos', () => {
      const input = "'; DROP TABLE users; --"
      const result = sanitizer.sanitizeString(input)

      expect(result).not.toContain("';")
      expect(result).toContain("''") // Comilla simple escapada
      expect(result).toContain('\\;') // Punto y coma escapado
    })

    test('debería remover scripts maliciosos', () => {
      const input = '<script>alert("xss")</script>Hola mundo'
      const result = sanitizer.sanitizeString(input)

      expect(result).not.toContain('<script>')
      expect(result).toContain('Hola mundo')
    })

    test('debería limitar la longitud del string', () => {
      const longString = 'a'.repeat(2000)
      const result = sanitizer.sanitizeString(longString)

      expect(result.length).toBeLessThanOrEqual(1000)
    })

    test('debería remover caracteres de control', () => {
      const input = 'Hola\x00\x1F\x7FMundo'
      const result = sanitizer.sanitizeString(input)

      expect(result).toBe('HolaMundo')
    })

    test('debería normalizar espacios en blanco', () => {
      const input = '  Hola    mundo   '
      const result = sanitizer.sanitizeString(input)

      expect(result).toBe('Hola mundo')
    })

    test('debería manejar strings vacíos y null', () => {
      expect(sanitizer.sanitizeString('')).toBe('')
      expect(sanitizer.sanitizeString(null)).toBe(null)
      expect(sanitizer.sanitizeString(undefined)).toBe(undefined)
    })

    test('debería escapar caracteres HTML', () => {
      const input = '<div>Test</div>'
      const result = sanitizer.sanitizeString(input)

      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })
  })

  describe('sanitizeObject', () => {
    test('debería sanitizar objetos simples', () => {
      const input = {
        name: "Juan'; DROP TABLE users;",
        email: 'test@example.com<script>alert("xss")</script>'
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.name).not.toContain("';")
      expect(result.email).not.toContain('<script>')
      expect(result.email).toContain('test@example.com')
    })

    test('debería sanitizar objetos anidados', () => {
      const input = {
        user: {
          profile: {
            bio: '<script>malicious()</script>Bio limpio'
          }
        }
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.user.profile.bio).not.toContain('<script>')
      expect(result.user.profile.bio).toContain('Bio limpio')
    })

    test('debería sanitizar arrays', () => {
      const input = {
        tags: ['javascript', "'; DELETE FROM tags;", 'nodejs']
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.tags[0]).toBe('javascript')
      expect(result.tags[1]).not.toContain("';")
      expect(result.tags[2]).toBe('nodejs')
    })

    test('debería preservar tipos de datos no-string', () => {
      const date = new Date()
      const input = {
        id: 123,
        active: true,
        created: date,
        score: 99.5
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.id).toBe(123)
      expect(result.active).toBe(true)
      expect(result.created).toBe(date)
      expect(result.score).toBe(99.5)
    })

    test('debería sanitizar las claves del objeto', () => {
      const input = {
        normal_key: 'value',
        'key<script>': 'otro_value'
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.normal_key).toBe('value')
      expect(Object.keys(result)).not.toContain('key<script>')
      expect(result['key&lt;script&gt;']).toBe('otro_value')
    })

    test('debería manejar arrays anidados', () => {
      const input = {
        matrix: [
          ['clean', '<script>dirty</script>'],
          ['another', "'; DROP TABLE;"]
        ]
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.matrix[0][0]).toBe('clean')
      expect(result.matrix[0][1]).not.toContain('<script>')
      expect(result.matrix[1][1]).not.toContain("';")
    })

    test('debería manejar null y undefined correctamente', () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: ''
      }

      const result = sanitizer.sanitizeObject(input)

      expect(result.nullValue).toBe(null)
      expect(result.undefinedValue).toBe(undefined)
      expect(result.emptyString).toBe('')
    })
  })

  describe('validateField', () => {
    test('debería validar emails correctamente', () => {
      expect(sanitizer.validateField('test@example.com', 'email')).toBe(true)
      expect(sanitizer.validateField('invalid-email', 'email')).toBe(false)
      expect(sanitizer.validateField('user@domain', 'email')).toBe(false)
    })

    test('debería validar teléfonos correctamente', () => {
      expect(sanitizer.validateField('+1234567890', 'phone')).toBe(true)
      expect(sanitizer.validateField('123-456-7890', 'phone')).toBe(true)
      expect(sanitizer.validateField('123', 'phone')).toBe(false)
    })

    test('debería validar URLs correctamente', () => {
      expect(sanitizer.validateField('https://example.com', 'url')).toBe(true)
      expect(sanitizer.validateField('http://test.org', 'url')).toBe(true)
      expect(sanitizer.validateField('ftp://example.com', 'url')).toBe(false)
    })

    test('debería validar campos alfanuméricos', () => {
      expect(sanitizer.validateField('Test123 ABC', 'alphanumeric')).toBe(true)
      expect(sanitizer.validateField('Test@123', 'alphanumeric')).toBe(false)
    })

    test('debería validar campos numéricos', () => {
      expect(sanitizer.validateField('12345', 'numeric')).toBe(true)
      expect(sanitizer.validateField('123abc', 'numeric')).toBe(false)
    })

    test('debería validar usernames', () => {
      expect(sanitizer.validateField('user123', 'username')).toBe(true)
      expect(sanitizer.validateField('test_user', 'username')).toBe(true)
      expect(sanitizer.validateField('ab', 'username')).toBe(false) // muy corto
      expect(sanitizer.validateField('user@123', 'username')).toBe(false) // caracteres inválidos
    })

    test('debería lanzar error para tipos de campo inválidos', () => {
      expect(() => {
        sanitizer.validateField('test', 'invalid_type')
      }).toThrow('Tipo de campo no válido: invalid_type')
    })
  })

  describe('forDatabase', () => {
    const testData = {
      name: "Test'; DROP TABLE;",
      content: 'Normal content'
    }

    test('debería aplicar reglas específicas para MySQL', () => {
      const result = sanitizer.forDatabase(testData, 'mysql')

      expect(result.name).not.toContain("';")
      expect(result.content).toBe('Normal content')
    })

    test('debería aplicar reglas específicas para PostgreSQL', () => {
      const testWithDollar = {
        query: "SELECT * FROM users WHERE id = $1'; DROP TABLE;"
      }

      const result = sanitizer.forDatabase(testWithDollar, 'postgresql')

      expect(result.query).not.toContain("';")
    })

    test('debería usar reglas generales para DB desconocida', () => {
      const result = sanitizer.forDatabase(testData, 'unknown_db')

      expect(result.name).not.toContain("';")
    })
  })

  describe('detectAndLog', () => {
    test('debería detectar intentos de inyección SQL', () => {
      const maliciousData = {
        query: 'SELECT * FROM users UNION SELECT password FROM admin'
      }

      const result = sanitizer.detectAndLog(maliciousData)

      expect(result.threats).toHaveLength(1)
      expect(result.threats[0].type).toBe('SQL_INJECTION')
      expect(result.threats[0].path).toBe('query')
    })

    test('debería detectar intentos de XSS', () => {
      const xssData = {
        comment: '<script>steal_cookies()</script>Comentario normal'
      }

      const result = sanitizer.detectAndLog(xssData)

      expect(result.threats).toHaveLength(1)
      expect(result.threats[0].type).toBe('XSS_ATTEMPT')
    })

    test('debería detectar múltiples amenazas', () => {
      const multipleThreats = {
        sql: 'DROP TABLE users',
        xss: '<script>alert("xss")</script>',
        normal: 'contenido normal'
      }

      const result = sanitizer.detectAndLog(multipleThreats)

      expect(result.threats.length).toBeGreaterThanOrEqual(2)
    })

    test('debería ejecutar callback cuando se detecten amenazas', () => {
      const logCallback = jest.fn()
      const maliciousData = {
        evil: 'DROP TABLE users'
      }

      sanitizer.detectAndLog(maliciousData, logCallback)

      expect(logCallback).toHaveBeenCalledWith(expect.any(Array))
    })

    test('debería retornar datos limpios junto con amenazas', () => {
      const dirtyData = {
        clean_field: 'normal data',
        dirty_field: '<script>evil()</script>también datos normales'
      }

      const result = sanitizer.detectAndLog(dirtyData)

      expect(result.clean.clean_field).toBe('normal data')
      expect(result.clean.dirty_field).not.toContain('<script>')
      expect(result.clean.dirty_field).toContain('también datos normales')
    })

    test('debería manejar objetos anidados en detección', () => {
      const nestedThreat = {
        user: {
          profile: {
            bio: 'UNION SELECT * FROM passwords'
          }
        }
      }

      const result = sanitizer.detectAndLog(nestedThreat)

      expect(result.threats).toHaveLength(1)
      expect(result.threats[0].path).toBe('user.profile.bio')
    })
  })

  describe('Casos edge', () => {
    test('debería manejar objetos circulares sin crash', () => {
      const circular = { name: 'test' }
      circular.self = circular

      // Esto no debería lanzar error, aunque puede no funcionar perfectamente
      expect(() => {
        sanitizer.sanitizeObject(circular)
      }).not.toThrow()
    })

    test('debería manejar strings muy largos', () => {
      const veryLongString = 'a'.repeat(100000)
      const input = { content: veryLongString }

      const result = sanitizer.sanitizeObject(input)

      expect(result.content.length).toBeLessThanOrEqual(1000)
    })

    test('debería manejar arrays vacíos', () => {
      const input = { tags: [] }
      const result = sanitizer.sanitizeObject(input)

      expect(Array.isArray(result.tags)).toBe(true)
      expect(result.tags).toHaveLength(0)
    })

    test('debería preservar Buffer objects', () => {
      const buffer = Buffer.from('test data')
      const input = { file: buffer }

      const result = sanitizer.sanitizeObject(input)

      expect(Buffer.isBuffer(result.file)).toBe(true)
      expect(result.file).toBe(buffer)
    })
  })

  describe('Performance tests', () => {
    test('debería procesar objetos grandes en tiempo razonable', () => {
      const largeObject = {}
      for (let i = 0; i < 1000; i++) {
        largeObject[`field_${i}`] = `value_${i}`
      }

      const startTime = Date.now()
      sanitizer.sanitizeObject(largeObject)
      const endTime = Date.now()

      // Debería procesar en menos de 1 segundo
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })
})
