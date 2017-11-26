import {download} from '../download'
import {isDirEmpty} from '../fs'
import path from 'path'
import fs from 'fs-extra'

describe('download', () => {

  const target = path.resolve(__dirname, 'fixtures/download')

  test('should download Git Repo', async () => {
    const info = await download('ulivz/my-first-poz', target)

    expect(info.name).toBe('my-first-poz')
    expect(info.origin).toBe('git')
    expect(isDirEmpty(target + '/my-first-poz')).toBe(false)

    await fs.remove(target + '/my-first-poz')
  })

  test('should download NPM package', async () => {
    const info = await download('n', target)

    expect(info.name).toBe('n')
    expect(info.origin).toBe('npm')
    expect(isDirEmpty(target + '/n')).toBe(false)

    await fs.remove(target + '/n')
  })

  test('should download Git Repo at root dir', async () => {
    const info = await download('ulivz/my-first-poz', target, { newfolder: false })

    expect(info.name).toBe('my-first-poz')
    expect(info.origin).toBe('git')
    expect(isDirEmpty(target)).toBe(false)

    await fs.emptyDir(target)
  })

  test('should download NPM package at root dir', async () => {
    const info = await download('n', target, { newfolder: false })

    expect(info.name).toBe('n')
    expect(info.origin).toBe('npm')
    expect(isDirEmpty(target)).toBe(false)

    await fs.emptyDir(target)
  })
  
})
