import fs from 'fs'

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

export function isDirEmpty(path) {
  if (!exists(path)) {
    throw new Error(`${path} not exist!`)
  }
  const files = fs.readdirSync(path)
  return !files.length
}



