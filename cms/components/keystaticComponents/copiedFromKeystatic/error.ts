// https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/src/form/fields/error.ts#L1
export class FieldDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FieldDataError'
  }
}
