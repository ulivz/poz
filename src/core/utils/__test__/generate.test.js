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
} from '../datatypes'


describe('datatype', () => {

  test('isBoolean', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)
    expect(isBoolean(1)).toBe(false)
    expect(isBoolean('1')).toBe(false)
    expect(isBoolean(() => '')).toBe(false)
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

  test('isInteger', () => {
    expect(isInteger(2)).toBe(true)
    expect(isInteger('2')).toBe(false)
    expect(isInteger(2.0)).toBe(true)
    expect(isInteger(2.1)).toBe(false)
  })

  // -(2^53 - 1) -> 2^53 - 1
  test('isSafeInteger', () => {
    expect(isSafeInteger(Math.pow(2, 53) - 1)).toBe(true)
    expect(isSafeInteger(Math.pow(2, 53))).toBe(false)
    expect(isSafeInteger(-(Math.pow(2, 53) - 1))).toBe(true)
    expect(isSafeInteger(-Math.pow(2, 53))).toBe(false)
  })

  test('isString', () => {
    expect(isString('1')).toBe(true)
    expect(isString(1)).toBe(false)
  })

  test('isUndefined', () => {
    expect(isUndefined(void 0)).toBe(true)
    expect(isUndefined(undefined)).toBe(true)
    const ob = {}
    expect(isUndefined(ob.a)).toBe(true)
  })

  test('isNull', () => {
    expect(isNull(null)).toBe(true)
    expect(isNull(undefined)).toBe(false)
  })

  test('isNullOrUndefined', () => {
    expect(isNullOrUndefined(null)).toBe(true)
    expect(isNullOrUndefined(undefined)).toBe(true)
    expect(isNullOrUndefined('')).toBe(false)
    expect(isNullOrUndefined(0)).toBe(false)
    expect(isNullOrUndefined([])).toBe(false)
    expect(isNullOrUndefined({})).toBe(false)
  })

  test('isFunction', () => {
    expect(isFunction(() => '')).toBe(true)
    expect(isFunction(function () {
    })).toBe(true)
  })

  test('isBuffer', () => {
    expect(isBuffer(new Buffer('123'))).toBe(true)
  })

  test('isGeneralizedObject', () => {

    expect(isGeneralizedObject({})).toBe(true)
    expect(isGeneralizedObject([])).toBe(true)
    expect(isGeneralizedObject(new Map())).toBe(true)
    expect(isGeneralizedObject(new Set())).toBe(true)
    expect(isGeneralizedObject(new WeakMap())).toBe(true)
    expect(isGeneralizedObject(new WeakSet())).toBe(true)
    expect(isGeneralizedObject(null)).toBe(true)

    expect(isGeneralizedObject(undefined)).toBe(false)
    expect(isGeneralizedObject(true)).toBe(false)
    expect(isGeneralizedObject('')).toBe(false)
    expect(isGeneralizedObject(0)).toBe(false)
    expect(isGeneralizedObject(Symbol(123))).toBe(false)
  })

  test('isPlainObject', () => {

    expect(isPlainObject({})).toBe(true)

    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
    expect(isPlainObject(new Set())).toBe(false)
    expect(isPlainObject(new WeakMap())).toBe(false)
    expect(isPlainObject(new WeakSet())).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject('')).toBe(false)
    expect(isPlainObject(0)).toBe(false)
    expect(isPlainObject(Symbol(123))).toBe(false)
  })

  test('isObject', () => {

    expect(isObject({})).toBe(true)
    expect(isObject([])).toBe(true)
    expect(isObject(new Map())).toBe(true)
    expect(isObject(new Set())).toBe(true)
    expect(isObject(new WeakMap())).toBe(true)
    expect(isObject(new WeakSet())).toBe(true)
    expect(isObject(() => '')).toBe(true)

    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject(true)).toBe(false)
    expect(isObject('')).toBe(false)
    expect(isObject(0)).toBe(false)
    expect(isObject(Symbol(123))).toBe(false)
  })

  function getArguements() {
    return arguments;
  }

  function customArrayLike() {
    return {
      '1': 1,
      '2': 2,
      length: 2
    }
  }

  test('isArray', () => {
    expect(isArray([])).toBe(true)
    expect(isArray(getArguements())).toBe(false)
    expect(isArray([...getArguements()])).toBe(true)
  })

  test('isArrayLike', () => {
    expect(isArrayLike(getArguements())).toBe(true)
    expect(isArrayLike(customArrayLike())).toBe(true)
    expect(isArrayLike([])).toBe(true)

    expect(isArrayLike(new Set())).toBe(false)
  })

  class MyPromise {
    constructor() {

    }

    then() {

    }

    catch() {

    }
  }

  test('isNativePromise', () => {
    expect(isNativePromise(Promise.resolve())).toBe(true)
    expect(isNativePromise(new MyPromise())).toBe(false)
  })

  test('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true)
    expect(isPromise(new MyPromise())).toBe(true)
  })

  test('isIterable', () => {
    expect(isIterable([])).toBe(true)
    expect(isIterable(new Set())).toBe(true)
    expect(isIterable(new Map())).toBe(true)

    expect(isIterable({})).toBe(false)
  })

  test('isGenerator', () => {
    const g = function*() {
      yield 1;
    }
    expect(isGenerator(g)).toBe(false)
    expect(isGenerator(g())).toBe(true)
  })

})
