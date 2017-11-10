import fs from 'fs'
import FileNode from './FileNode'
import {resolve} from '../utils/path'

export default class FileTree {

  static getFileTree(dirname, options = {}) {

    let rootNode = new FileNode(dirname, dirname)
    if (!rootNode.isDirectory) {
      return Promise.resolve(rootNode)
    }

    rootNode.depth = 0
    return FileTree.traverseChildNodes(rootNode, options.maxDepth)
  }

}

export const getFileTree = (dirname, depth) => {
  const fileTree = new FileNode(dirname, dirname)
  if (!fileTree.isDirectory) {
  }
  fileTree.nodes = []
  fileTree.depth = 0

  const mapDir = (dir, nodes, dep) => {
    dep++
    return promisify(fs.readdir, dir).then(files => {
      const subPromises = []
      for (let i = 0, l = files.length; i < l; i++) {
        const file = files[i]
        const fullPath = resolve(dir, file)
        const node = new FileNode(fullPath, dir)
        node.depth = dep
        nodes.push(node)
        if (node.depth <= depth && isDirectory(fullPath)) {
          node.nodes = []
          subPromises.push(
            mapDir(fullPath, node.nodes, dep)
          )
        }
      }
      return Promise.all(subPromises)
    })
  }

  return mapDir(dirname, fileTree.nodes, fileTree.depth)
    .then(() => fileTree)
}
