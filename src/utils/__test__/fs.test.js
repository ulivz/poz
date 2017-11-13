import archy from 'archy'
import chalk from 'chalk'
import {parseColor, echo} from '../log'

import {
exists,
isFile,
isDirectory,
readdirSync,
isDirEmpty,
unlinkSync,
} from '../fs'


describe('fs', () => {

  test('exists', () => {
    let dir = __dirname + '/fixtures/dist'
    expect(exists(dir)).toBe(false)
  })

  test('isFile && isDirectory', () => {

    let file = __dirname + '/fixtures/.gitconfig'
    let dir = __dirname + '/fixtures/src'
    let unexistFile = __dirname + '/fs2.js'
    let unexistDir = __dirname + '/fs2'

    expect(isFile(file)).toBe(true)
    expect(isFile(dir)).toBe(false)
    expect(isFile(unexistFile)).toBe(null)
    expect(isDirectory(dir)).toBe(true)
    expect(isDirectory(file)).toBe(false)
    expect(isDirectory(unexistDir)).toBe(null)

  })

  let source = __dirname + '/fixtures/fs/source'
  let target = __dirname + '/fixtures/fs/target'

  test('isDirEmpty', () => {
    expect(isDirEmpty(source)).toBe(false)
    expect(isDirEmpty(target)).toBe(true)
  })

  // test('copy', () => {
  //   return copy(source, target).then(() => {
  //     let files = readdirSync(target)
  //     expect(files[0]).toBe('.gitignore')
  //     unlinkSync(target + '/' + files[0])
  //   })
  // })

  test('FileNode', () => {
    const baseDir = __dirname
    const fullpath = baseDir + '/fixtures'
    const file = FileNode.create(fullpath, baseDir)
    expect(file.path).toBe('fixtures')
    expect(file.isFile).toBe(false)
    expect(file.isDirectory).toBe(true)
    expect(file.label).toBe('fixtures')
  })

  test('getFileTree', () => {
    return getFileTree(__dirname)
      .then(result => {
        console.log(result)
        console.log(parseColor(`<yellow>${archy(result)}</yellow>`))
      })
      .catch(err => {
        console.log(err)
      })
  })


})
