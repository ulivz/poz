import fs from 'fs'
import {resolve, relative} from './path'
import {isUndefined} from './datatypes'
import {promisify} from './promise'

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

export const readdirSync = fs.readdirSync

export function isDirEmpty(path) {
  if (!exists(path)) {
    throw new Error(`${path} not exist!`)
  }
  const files = readdirSync(path)
  return !files.length
}

// export const copy = fs.copy

export const unlinkSync = fs.unlinkSync




