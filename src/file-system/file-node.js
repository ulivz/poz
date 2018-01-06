import fs from 'fs'
import Node from './node'
import { dest } from './node'

export default class FileNode extends Node {

  constructor(path, cwd) {
    super(path, cwd)
    this.isFile = true
    this._contents = null
  }

  get contents() {
    if (this._contents) {
      return this._contents
    }
    this._contents = fs.readFileSync(this.path, 'utf-8')
    return this._contents
  }

  setpath(newpath) {
    this.path = newpath
  }

  toJSON() {
    return this._toJSON()
  }

}
