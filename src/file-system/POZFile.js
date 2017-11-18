import fs from 'fs'
import POZFileTreeNode from './POZFileTreeNode'
import {dest} from './POZFileTreeNode'

export default class FileNode extends POZFileTreeNode {

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

  dest(target, transformer) {
    return dest(this.path, target, transformer)
  }

}
