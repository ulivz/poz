import POA from '../POA'
import {resolve} from '../../utils/path'

describe('POA', () => {

  let prevCwd = process.cwd()

  beforeAll(() => {
    process.chdir(resolve(__dirname, 'fixtures'))
  })

  afterAll(() => {
    process.chdir(prevCwd)
  })

  test('base', () => {
    console.log(resolve(__dirname, '../../../packages/nm'))
    const ins = new POA(resolve(__dirname, '../../../packages/nm'))
    return ins.run()
  })

})
