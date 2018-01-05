import POZ from '../POZ'
import { resolve } from '../../utils/path'

describe('POZ', () => {

  let prevCwd = process.cwd()

  beforeAll(() => {
    process.chdir(resolve(__dirname, 'fixtures'))
  })

  afterAll(() => {
    process.chdir(prevCwd)
  })

  function getPkg(dirname) {
    return __dirname + '/fixtures/POZTestPackage_' + dirname
  }

  test('Should each life cycle works', async () => {
    const POZTestPackagePath = getPkg('VALID')
    const app = new POZ(POZTestPackagePath)
    await app.start()
    expect(app.context.calledLifeCycle).toEqual(app.env.POZ_LIFE_CYCLE)
  })

  test('Should throw error when giving a nonexisitng package directory', async () => {
    const POZTestPackagePath = getPkg('INVALID_0')
    try {
      new POZ(POZTestPackagePath)
    } catch (err) {
      expect(err.message).toBe('NOT_FOUND')
    }
  })

  test('Should throw error when not found "poz.js"', async () => {
    const POZTestPackagePath = getPkg('INVALID_1')
    try {
      new POZ(POZTestPackagePath)
    } catch (err) {
      expect(err.message).toBe('MISSING_INDEX_FILE')
    }
  })

  test('Should throw error when "poz.js" is a empty JavaScript file', async () => {
    const POZTestPackagePath = getPkg('INVALID_2')
    try {
      new POZ(POZTestPackagePath)
    } catch (err) {
      expect(err.message).toBe('UNEXPECTED_INDEX_FILE')
    }
  })

  test('Should throw error when "poz.js" not export plain object or function', async () => {
    const POZTestPackagePath = getPkg('INVALID_3')
    try {
      new POZ(POZTestPackagePath)
    } catch (err) {
      expect(err.message).toBe('UNEXPECTED_INDEX_FILE')
    }
  })

  test('Should throw error when missing "template" directory', async () => {
    const POZTestPackagePath = getPkg('INVALID_4')
    try {
      new POZ(POZTestPackagePath)
    } catch (err) {
      expect(err.message).toBe('MISSING_TEMPLATE_DIRECTORY')
    }
  })

})
