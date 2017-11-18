import PATH from 'path'
import VFS from 'vinyl-fs'
import map from 'map-stream'
import {isString, isFunction, isArray} from '../utils/datatypes'

export function dest(sourcePath, targetPath, transformer) {

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

export default class POAFileTreeNode {

  constructor(path, cwd) {
    this.path = path
    this.cwd = cwd
    this.relative = PATH.relative(cwd, path)
    this.basename = this.label = path.split('/').pop()

    const BaseNameSplitList = this.basename.split('.')
    this.stem = BaseNameSplitList[0]
    this.extname = BaseNameSplitList[1]
  }

}
