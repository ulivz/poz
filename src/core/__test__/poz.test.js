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

  function getPkgPath(dirname) {
    return __dirname + '/fixtures/POZTestPackage_' + dirname
  }

  test('Should each life cycle works', async () => {
    const pkgPath = getPkgPath('VALID')
    const app = poz(pkgPath, false)
    const files = await app.launch()
    expect(files).toMatchSnapshot()
    expect(app.context.calledLifeCycle).toEqual(LIFE_CYCLE)
  })

  test('Should throw error when giving a nonexisitng package directory', async () => {
    const pkgPath = getPkgPath('INVALID_0')
    const app = poz(pkgPath, false)
    const { error } = app
    expect(error.currentErrorCode()).toBe('NOT_FOUND')
  })

  test('Should throw error when not found "poz.js"', async () => {
    const pkgPath = getPkgPath('INVALID_1')
    const app = poz(pkgPath, false)
    const { error } = app
    expect(error.currentErrorCode()).toBe('MISSING_ENTRY_FILE')
  })

  test('Should throw error when "poz.js" is a empty JavaScript file', async () => {
    const pkgPath = getPkgPath('INVALID_2')
    const app = poz(pkgPath, false)
    const { error } = app
    expect(error.currentErrorCode()).toBe('CANNOT_EXPORT_EMPTY_OBJECT')
  })

  test('Should throw error when "poz.js" not export plain object or function', async () => {
    const pkgPath = getPkgPath('INVALID_3')
    const app = poz(pkgPath, false)
    const { error } = app
    expect(error.currentErrorCode()).toBe('UNEXPECTED_ENTRY_FILE')
  })

  test('Should throw error when missing "template" directory', async () => {
    const pkgPath = getPkgPath('INVALID_4')
    const app = poz(pkgPath, false)
    const { error } = app
    expect(error.currentErrorCode()).toBe('MISSING_TEMPLATE_DIRECTORY')
  })

})
