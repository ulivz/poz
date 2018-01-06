import PATH from 'path'
import { isUndefined } from '../utils/datatypes'

const JSON_STRINGIFY_FIELDS = [
  // 'path',
  'cwd',
  'relative',
  'basename',
  // 'stem',
  '__IGNORED__'
  // 'extname'
]

export default class Node {

  constructor(path, cwd = process.cwd()) {
    this.cwd = cwd
    this.__path = [path]
  }

  get path() {
    return this.__path[this.__path.length - 1]
  }

  set path(path) {
    this.__path.push(path)
  }

  get originalPath() {
    return this.__path[0]
  }

  get originalRelative() {
    return PATH.relative(this.cwd, this.originalPath)
  }

  get relative() {
    return PATH.relative(this.cwd, this.path)
  }

  get basename() {
    return this.path.split('/').pop()
  }

  get label() {
    return this.basename
  }

  get stem() {
    return this.basename.split('.')[0]
  }

  get extname() {
    return this.basename.split('.')[1]
  }

  rename(newname) {
    let newpath = PATH.join(
      this.path.slice(0, this.path.lastIndexOf('/')),
      newname
    )
    this.setpath(newpath)
  }

  _toJSON() {
    const fields = {}
    JSON_STRINGIFY_FIELDS.forEach(field => {
      if (!isUndefined(this[field])) {
        fields[field] = this[field]
      }
    })
    return fields
  }
}
