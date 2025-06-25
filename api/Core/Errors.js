export class AppError extends Error {
  constructor (message, code = 'INTERNAL_ERROR') {
    super(message)
    this.code = code
    this.name = this.constructor.name // Mejor identificación en logs
    Error.captureStackTrace?.(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor (message) {
    super(message, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor (message) {
    super(message, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor (message) {
    super(message, 'CONFLICT')
  }
}

export class DatabaseError extends AppError {
  constructor (message) {
    super(message, 'DATABASE_ERROR')
  }
}
