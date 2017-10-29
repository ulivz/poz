import {noop} from '../function'

describe('function', () => {

  test('noop', () => {
    expect(noop()).toBe(undefined)
  })

})
