import fs from 'fs'
import {resolve, relative} from './path'
import {isUndefined} from './datatypes'

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


export class FileNode {
  constructor(fullPath, baseDir, isFile$, isDirectory$) {
    this.fullPath = fullPath
    this.baseDir = baseDir
    this.path = relative(this.baseDir, this.fullPath)
    this.label = this.fullPath.split('/').pop()
    this.isFile = isUndefined(isFile$) ? isFile(this.fullPath) : isFile$
    this.isDirectory = isUndefined(isDirectory$) ? isDirectory(this.fullPath) : isDirectory$
    // this.contents =
  }

  static create(...args) {
    return new FileNode(...args)
  }
}


const Promisify = function (fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, function (err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}


export const getFileTree = (dirname, depth) => {
  const fileTree = FileNode.create(dirname, dirname)
  if (!fileTree.isDirectory) {
    return Promise.resolve(fileTree)
  }
  fileTree.nodes = []

  const mapDir = (dir, nodes) => {
    return Promisify(fs.readdir, dir).then(files => {
      const subPromises = []
      for (let i = 0, l = files.length; i < l; i++) {
        const file = files[i]
        const fullPath = resolve(dir, file)
        const node = FileNode.create(fullPath, dir)
        nodes.push(node)
        if (isDirectory(fullPath)) {
          node.nodes = []
          subPromises.push(
            mapDir(fullPath, node.nodes)
          )
        }
      }
      return Promise.all(subPromises)
    })
  }

  return mapDir(dirname, fileTree.nodes)
    .then(() => fileTree)
}


