import fs from 'fs'
import {promisify} from '../promise'
import {isPromise} from '../datatypes'

describe('promise', () => {

  test('promisify', () => {
    const filePath = __filename;
    let readFilePromise = promisify(fs.readFile, filePath, 'utf-8')
    expect(isPromise(readFilePromise)).toBe(true)
    return readFilePromise.then(content => {
      expect(content.indexOf('promisify') !== -1).toBe(true)
    })
  })

})
