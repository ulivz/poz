import poz from '../poz'
import { LIFE_CYCLE } from '../presets'
import { resolve } from 'path'

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
    const app = poz(POZTestPackagePath)
    await app.launch()
    console.log(app.context.calledLifeCycle)
    expect(app.context.calledLifeCycle).toEqual(LIFE_CYCLE)
  })

  test('Should throw error when giving a nonexisitng package directory', async () => {
    const POZTestPackagePath = getPkg('INVALID_0')
    const app = poz(POZTestPackagePath)
    const { errors } = app
    expect(errors[0].code).toBe('NOT_FOUND')
  })

  test('Should throw error when not found "poz.js"', async () => {
    const POZTestPackagePath = getPkg('INVALID_1')
    const app = poz(POZTestPackagePath)
    const { errors } = app
    expect(errors[0].code).toBe('MISSING_INDEX_FILE')
  })

  test('Should throw error when "poz.js" is a empty JavaScript file', async () => {
    const POZTestPackagePath = getPkg('INVALID_2')
    const app = poz(POZTestPackagePath)
    const { errors } = app
    expect(errors[0].code).toBe('UNEXPECTED_INDEX_FILE')
  })

  test('Should throw error when "poz.js" not export plain object or function', async () => {
    const POZTestPackagePath = getPkg('INVALID_3')
    const app = poz(POZTestPackagePath)
    const { errors } = app
    expect(errors[0].code).toBe('UNEXPECTED_INDEX_FILE')
  })

  test('Should throw error when missing "template" directory', async () => {
    const POZTestPackagePath = getPkg('INVALID_4')
    const app = poz(POZTestPackagePath)
    const { errors } = app
    expect(errors[0].code).toBe('MISSING_TEMPLATE_DIRECTORY')
  })

})
