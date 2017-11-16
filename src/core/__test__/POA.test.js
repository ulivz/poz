import POA from '../POA'
import {resolve} from '../../utils/path'

describe('POA', () => {

  let prevCwd = process.cwd()

  beforeAll(() => {
    process.chdir(resolve(__dirname, 'fixtures'))
  })

  // afterAll(() => {
  //   process.chdir(prevCwd)
  // })

  test('basic', () => {
    const POATestPackagePath = __dirname + '/fixtures/POATestPackage'
    const ins = new POA(POATestPackagePath)
    return ins.start()
  })

})
