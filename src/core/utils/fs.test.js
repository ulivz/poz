import {resolve} from './path'
import {exists, isFile, isDirectory} from './fs'

describe('fs', () => {

  test('exists', () => {
    let dir = __dirname + '/poa'
    expect(exists(dir)).toBe(false)
  })

  test('isFile && isDirectory', () => {

    let file = __dirname + '/fs.js'
    let dir = resolve(__dirname, '../utils')
    let unexistFile = __dirname + '/fs2.js'
    let unexistDir = __dirname + '/fs2'

    expect(isFile(file)).toBe(true)
    expect(isFile(dir)).toBe(false)
    expect(isFile(unexistFile)).toBe(null)
    expect(isDirectory(dir)).toBe(true)
    expect(isDirectory(file)).toBe(false)
    expect(isDirectory(unexistDir)).toBe(null)

  })

})
