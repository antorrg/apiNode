export default class DataSanitizer {
  constructor (options = {}) {
    this.options = {
      // Caracteres peligrosos para SQL injection
      sqlDangerous: /['";\\<>]/g,
      // Caracteres peligrosos para XSS
      xssPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ],
      // Longitud máxima por defecto
      maxLength: 1000,
      // Permitir HTML básico
      allowBasicHtml: false,
      ...options
    }
  }

  /**
   * Sanitiza un string individual
   */
  sanitizeString (str, customRules = {}) {
    if (typeof str !== 'string') return str

    const rules = { ...this.options, ...customRules }
    let sanitized = str

    // Limitar longitud
    if (rules.maxLength && sanitized.length > rules.maxLength) {
      sanitized = sanitized.substring(0, rules.maxLength)
    }

    // Remover caracteres de control
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

    // Escapar caracteres SQL peligrosos
    sanitized = sanitized.replace(rules.sqlDangerous, (match) => {
      const escapeMap = {
        "'": "''",
        '"': '""',
        ';': '\\;',
        '\\': '\\\\',
        '<': '&lt;',
        '>': '&gt;'
      }
      return escapeMap[match] || match
    })

    // Remover patrones XSS si no se permite HTML
    if (!rules.allowBasicHtml) {
      rules.xssPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '')
      })
    }

    // Normalizar espacios en blanco
    sanitized = sanitized.replace(/\s+/g, ' ').trim()

    return sanitized
  }

  /**
   * Sanitiza un objeto recursivamente
   */
  sanitizeObject (obj, customRules = {}, visited = new WeakSet()) {
    if (obj === null || obj === undefined) return obj

    // Si es un array
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, customRules, visited))
    }

    // Si es un objeto Date, Buffer, etc., devolverlo tal como está
    if (obj instanceof Date || Buffer.isBuffer(obj)) {
      return obj
    }

    // Si es un string
    if (typeof obj === 'string') {
      return this.sanitizeString(obj, customRules)
    }

    // Si es un número o booleano
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj
    }

    // Si es un objeto
    if (typeof obj === 'object') {
    // ✅ AGREGAR ESTA PARTE PARA MANEJAR CIRCULARES
      if (visited.has(obj)) {
        return '[Circular Reference]' // o return {}; si prefieres un objeto vacío
      }
      visited.add(obj)
      // ✅ FIN DE LA PARTE NUEVA

      const sanitized = {}

      for (const [key, value] of Object.entries(obj)) {
      // También sanitizar las claves
        const cleanKey = this.sanitizeString(key, { maxLength: 100 })
        sanitized[cleanKey] = this.sanitizeObject(value, customRules, visited)
      }

      return sanitized
    }

    return obj
  }

  /**
   * Validación específica para campos comunes
   */
  validateField (value, fieldType) {
    const validators = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[\d\s\-\(\)]{10,}$/,
      url: /^https?:\/\/.+/,
      alphanumeric: /^[a-zA-Z0-9\s]+$/,
      numeric: /^\d+$/,
      username: /^[a-zA-Z0-9_]{3,20}$/
    }

    if (!validators[fieldType]) {
      throw new Error(`Tipo de campo no válido: ${fieldType}`)
    }

    return validators[fieldType].test(value)
  }

  /**
   * Sanitización para diferentes contextos de base de datos
   */
  forDatabase (obj, dbType = 'general') {
    const dbRules = {
      mysql: {
        sqlDangerous: /['";\\]/g,
        maxLength: 65535
      },
      postgresql: {
        sqlDangerous: /['";\\$]/g,
        maxLength: 1000000
      },
      sqlite: {
        sqlDangerous: /['";]/g,
        maxLength: 1000000
      },
      general: this.options
    }

    return this.sanitizeObject(obj, dbRules[dbType] || dbRules.general)
  }

  /**
   * Logging de intentos de inyección detectados
   */
  detectAndLog (obj, logCallback = null) {
    const threats = []

    const checkThreats = (value, path = '') => {
      if (typeof value === 'string') {
        // Detectar posibles inyecciones SQL
        if (/union\s+select|drop\s+table|insert\s+into|delete\s+from/i.test(value)) {
          threats.push({ type: 'SQL_INJECTION', path, value })
        }

        // Detectar XSS
        if (/<script|javascript:|on\w+=/i.test(value)) {
          threats.push({ type: 'XSS_ATTEMPT', path, value })
        }
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          checkThreats(val, path ? `${path}.${key}` : key)
        })
      }
    }

    checkThreats(obj)

    if (threats.length > 0 && logCallback) {
      logCallback(threats)
    }

    return {
      clean: this.sanitizeObject(obj),
      threats
    }
  }
}

// Ejemplo de uso
const sanitizer = new DataSanitizer({
  maxLength: 500,
  allowBasicHtml: false
})

// Ejemplo con datos peligrosos
const userData = {
  name: "Juan'; DROP TABLE users; --",
  email: "test@example.com<script>alert('xss')</script>",
  bio: 'Desarrollador con más de 10 años de experiencia...',
  tags: ['javascript', 'node.js', "'; DELETE FROM tags; --"]
}

console.log('Datos originales:', userData)

// Sanitizar con logging
const result = sanitizer.detectAndLog(userData, (threats) => {
  console.log('⚠️  Amenazas detectadas:', threats)
})

console.log('Datos sanitizados:', result.clean)

// Para un contexto específico de DB
const forMysql = sanitizer.forDatabase(userData, 'mysql')
console.log('Para MySQL:', forMysql)

// Validar campos específicos
try {
  console.log('Email válido:', sanitizer.validateField('test@example.com', 'email'))
  console.log('Username válido:', sanitizer.validateField('user123', 'username'))
} catch (error) {
  console.error('Error de validación:', error.message)
}
