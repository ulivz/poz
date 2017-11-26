import {resolve} from '../path'
import {getPkg} from '../pkg'

describe('pkg', () => {

  test('getPkg', () => {
    const result = getPkg(resolve(__dirname, 'fixtures'))
    expect(result.name).toBe('poa')
  })

  test('getPkg - not exist - return {}', () => {
    const result = getPkg(resolve(__dirname))
    expect(result).toEqual({})
  })

})
