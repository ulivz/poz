import {resolve} from './path'
import {getPkg} from './pkg'

describe('pkg', () => {

  // beforeAll(() => {
  //   process.chdir('getPkg')
  // })
  //
  // beforeAll(() => {
  //   process.chdir('getPkg')
  // })

  test('getPkg', () => {
    const result = getPkg(resolve(__dirname, 'fixtures'))
    expect(result.name).toBe('poa')
  })

  test('getPkg - not exist - return null', () => {
    const result = getPkg(resolve(__dirname))
    expect(result).toBe(null)
  })

})
