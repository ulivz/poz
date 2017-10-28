import {resolve} from '../path'

describe('path', () => {
  test('resolve', () => {
    expect(resolve('a', 'b')).toBe(process.cwd() + '/a/b')
    expect(resolve('a', '../b')).toBe(process.cwd() + '/b')
  })
})
