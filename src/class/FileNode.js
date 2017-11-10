import FileSystemNode from './FileSystemNode'

export default class FileNode extends FileSystemNode {

  constructor(abosultePath, cwd, options = {}) {
    super(abosultePath, cwd, options)
    this.isFile = true
  }

}
