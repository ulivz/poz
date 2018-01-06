import fs from 'fs'
import Directory from './directory-node'
import File from './file-node'

function filex(target, cwd) {
  if (!fs.existsSync(target)) {
    throw new Error()
  }
  if (fs.statSync(target).isDirectory()) {
    return new Directory(target, cwd)
  }
  return new File(target, cwd)
}

export { filex as default, Directory, File }
