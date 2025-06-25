
export class DbParsers {
  static boolParser (op) {
    const normalized = String(op).toLowerCase().trim()
    return (normalized === 'true' || normalized === '1') ? 1 : 0
  }

  static reverBoolParser (nm) {
    return (Number(nm) === 1)
  }

  static parserEnum (str) {
    if (!str) return 'USER';
    const enums = ['ADMIN', 'MODERATOR', 'USER', 'DOCTOR']
    const newEn = str.toString().toUpperCase()
    return enums.includes(newEn) ? newEn : 'USER'
  }
}
