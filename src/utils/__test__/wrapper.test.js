import {statusWrapper} from '../wrapper'
import {isPromise} from '../datatypes'

describe('wrapper', () => {

  function sleep() {
    return Promise.resolve(1)
  }

  test('statusWrapper - return value', () => {
    const res = statusWrapper(require, 'a.js')
    expect(res.status).toBe(500)
    expect(res.out).toBe(undefined)
  })

  test('statusWrapper - return promise', () => {
    const res = statusWrapper(sleep)
    expect(res.status).toBe(200)
    expect(isPromise(res.out)).toBe(true)
  })

})
