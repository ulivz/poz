import path from 'path'

export default class FileSystemNode {

  constructor(abosultePath, cwd, options = {}) {
    this.abosultePath = abosultePath
    this.cwd = cwd
    this.relativePath = path.relative(abosultePath, cwd)
    this.nodeName = this.label = options.nodeName || abosultePath.split('/').pop()
  }
}
