import {download} from '../download'
import {isDirEmpty} from '../fs'
import path from 'path'
import fs from 'fs-extra'

describe('download', () => {

  const target = path.resolve(__dirname, 'fixtures/download')

  expect(isDirEmpty(target)).toBe(true)

  test('should download Git Repo', () => {
    return download('ulivz/my-first-poz', target).then((info) => {
      expect(info.packageName).toBe('my-first-poz')
      expect(info.git).toBe(true)
      expect(isDirEmpty(target + '/my-first-poz')).toBe(false)
      return fs.remove(target + '/my-first-poz')
    })
  })

  test('should download NPM package', () => {
    return download('n', target).then((info) => {
      expect(info.packageName).toBe('n')
      expect(info.npm).toBe(true)
      expect(isDirEmpty(target + '/n')).toBe(false)
      return fs.remove(target + '/n')
    })
  })

  test('should download Git Repo at root dir', () => {
    return download('ulivz/my-first-poz', target, { newfolder: false }).then((info) => {
      expect(info.packageName).toBe('my-first-poz')
      expect(info.git).toBe(true)
      expect(isDirEmpty(target)).toBe(false)
      return fs.emptyDir(target)
    })
  })

  test('should download NPM package at root dir', () => {
    return download('n', target, { newfolder: false }).then((info) => {
      expect(info.packageName).toBe('n')
      expect(info.npm).toBe(true)
      expect(isDirEmpty(target)).toBe(false)
      return fs.emptyDir(target)
    })
  })

  expect(isDirEmpty(target)).toBe(true)

})
