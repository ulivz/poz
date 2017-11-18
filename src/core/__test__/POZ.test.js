import POZ from '../POZ'
import {resolve} from '../../utils/path'

describe('POZ', () => {

  let prevCwd = process.cwd()

  beforeAll(() => {
    process.chdir(resolve(__dirname, 'fixtures'))
  })

  // afterAll(() => {
  //   process.chdir(prevCwd)
  // })

  test('basic', () => {
    const POZTestPackagePath =  __dirname + '/fixtures/POZTestPackage'
    const ins = new POZ(POZTestPackagePath)
    return ins.start()
  })

})
