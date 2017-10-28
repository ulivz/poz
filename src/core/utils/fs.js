import fs from 'fs-extra'
import {statusWrapper} from './wrapper'

export function exists(path) {
  return fs.existsSync(path)
}

export function isFile(path) {
  if (!exists(path)) {
    return null;
  }
  const stat = fs.statSync(path)
  return stat.isFile()
}

export function isDirectory(path) {
  if (!exists(path)) {
    return null;
  }
  const stat = fs.statSync(path)
  return stat.isDirectory()
}

export function copy(...args) {
  return statusWrapper()
}
