import path from 'path'
import VFS from 'vinyl-fs'
import map from 'map-stream'
import {isString, isFunction, isArray} from '../utils/datatypes'

export function spawnStream(sourcePath, targetPath, transformer) {

  if (!isString(sourcePath) && !isArray(sourcePath)) {
    throw new Error('Expected "sourcePath" to be string or array')
  }
  if (!isString(targetPath)) {
    throw new Error('Expected "targetPath" to be string')
  }

  const globs = sourcePath
  const stream = VFS.src(globs)

  if (!isFunction(transformer)) {
    transformer = null
    stream.emit('unExpectedTransformer')
  }

  stream.pipe(map((file, cb) => {
    if (transformer) {
      try {
        transformer(file)
      } catch (error) {
        stream.emit('transFormError', error)
      }
    }

    cb(null, file)
  }))
    .pipe(VFS.dest(targetPath))
  return stream
}

export default class FileSystemNode {

  constructor(abosultePath, cwd, options = {}) {
    this.abosultePath = abosultePath
    this.cwd = cwd
    this.isRoot = this.abosultePath === this.cwd
    this.relativePath = path.relative(abosultePath, cwd)
    this.nodeName = this.label = options.nodeName || abosultePath.split('/').pop()
  }

  dest() {
    throw new Error('No implementation')
  }
}
