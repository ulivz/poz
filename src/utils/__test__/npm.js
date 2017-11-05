import {npmInstall, yarnInstall} from '../npm'

describe('npm', () => {

  beforeAll(() => {
    process.chdir(resolve(__dirname, 'fixtures'))
  })

  afterAll(() => {
    process.chdir(prevCwd)
  })
  
  test('npmInstall', () => {
    const X =
      expect(XXX).toBe(true)
  })

})
