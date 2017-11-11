import fs from 'fs'
import FileSystemNode from './FileSystemNode'
import {spawnStream} from './FileSystemNode'

export default class FileNode extends FileSystemNode {

  constructor(abosultePath, cwd, options = {}) {
    super(abosultePath, cwd, options)
    this.isFile = true
    this._contents = null
  }

  get contents() {
    if (this._contents) {
      return this._contents
    }
    this._contents = fs.readFileSync(this.abosultePath, 'utf-8')
    return this._contents
  }

  dest(targetPath, transformer) {
    return spawnStream(this.abosultePath, targetPath, transformer)
  }

}
