import fs from 'fs-extra'
import { mixin } from './mixin'

function isFile(path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  const stat = fs.statSync(path)
  return stat.isFile()
}

function isDirectory(path) {
  if (!fs.existsSync(path)) {
    return null;
  }
  const stat = fs.statSync(path)
  return stat.isDirectory()
}

function isDirEmpty(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`${path} not exist!`)
  }
  const files = fs.readdirSync(path)
  return !files.length
}

mixin(fs, {
  isFile,
  isDirectory,
  isDirEmpty
})

export {
  fs as default,
  isFile,
  isDirectory,
  isDirEmpty
}



