import {
  isBoolean,
  isSymbol,
  isInteger,
  isSafeInteger,
  isString,
  isUndefined,
  isNull,
  isNullOrUndefined,
  isFunction,
  isBuffer,
  isGeneralizedObject,
  isPlainObject,
  isObject,
  isArray,
  isArrayLike,
  isNativePromise,
  isPromise,
  isIterable,
  isGenerator
} from './datatypes'


describe('datatype', () => {

  test('isBoolean', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)
    expect(isBoolean(1)).toBe(false)
    expect(isBoolean('1')).toBe(false)
    expect(isBoolean(()=>{})).toBe(false)
    expect(isBoolean(undefined)).toBe(false)
    expect(isBoolean(null)).toBe(false)
    expect(isBoolean({})).toBe(false)
    expect(isBoolean([])).toBe(false)
    expect(isBoolean(new Set())).toBe(false)
    expect(isBoolean(new Map())).toBe(false)
  })

  test('isSymbol', () => {
    expect(isSymbol(Symbol('-'))).toBe(true)
  })

})
