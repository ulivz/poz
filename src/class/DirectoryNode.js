import fs from 'fs'
import path from 'path'
import FileSystemNode from './FileSystemNode'
import FileNode from './FileNode'
import {isFile, isDirectory} from '../utils/fs'
import {isString, isArray, isPlainObject} from '../utils/datatypes'
import {spawnStream} from './FileSystemNode'


export default class DirectoryNode extends FileSystemNode {

  constructor(abosultePath, cwd, options = {}) {
    if (!cwd) {
      cwd = abosultePath
    }
    super(abosultePath, cwd, options)
    this.isDirectory = true
    this.nodes = this.childNodes = []
    this.isTraversed = false
    this.src = [this.abosultePath + '/**']
  }

  _reversePattern(pattern) {
    return '!' + this.abosultePath + '/' + pattern
  }

  setDestIgnore(pattern) {
    if (isString(pattern)) {
      this.src.push(this._reversePattern(i))
    } else if (isArray(pattern)) {
      this.src = this.src.concat(pattern.map(i => this._reversePattern(i)))
    } else if (isPlainObject(pattern)) {
      Object.keys(pattern).forEach(i => {
        if (pattern[i]) {
          this.src.push(this._reversePattern(i))
        }
      })
    }
  }

  dest(targetPath, transformer) {
    return spawnStream(this.src, targetPath, transformer)
  }

  traverse() {
    return this.recursiveTraverse().then(() => {
      this.isTraversed = true;
    })
  }

  recursiveTraverse(maxDepth) {
    if (this.isTraversed) {
      return Promise.resolve()
    }
    let parentNode = this
    let traverseDepth = parentNode.depth + 1
    return new Promise((resolve, reject) => {
      fs.readdir(parentNode.abosultePath, (error, childNodeNames) => {
        if (error) {
          reject(error)
        }
        let traverseChildNodesPromises = []

        for (let childNodeName of childNodeNames) {
          let childNodeabosultePath = path.resolve(parentNode.abosultePath, childNodeName)
          let isChildNodeFile = isFile(childNodeabosultePath)
          let ChildNodeConstructor = isChildNodeFile ? FileNode : DirectoryNode
          let childNode = new ChildNodeConstructor(childNodeabosultePath, parentNode.abosultePath, { nodeName: childNodeName })

          childNode.parentNode = parentNode
          childNode.depth = traverseDepth
          parentNode.childNodes.push(childNode)

          if (childNode.isDirectory && (!maxDepth || traverseDepth <= maxDepth)) {
            traverseChildNodesPromises.push(
              this.recursiveTraverse.call(childNode, maxDepth).then(() => {
                this.isTraversed = true;
              })
            )
          }
        }
        Promise.all(traverseChildNodesPromises).then(resolve)
      })
    })
  }

  children() {
    return this.childNodes
  }

  siblings() {
    return this.parentNode.childNodes.filter(childNode => childNode !== this)
  }

  _basicSearch(type, keyword) {
    if (!keyword || !this.nodes.length) {
      return null
    }

    let stack = []
    for (let i = 0, l = this.nodes.length; i < l; i++) {
      let node = this.nodes[i]
      stack.push(node)
    }

    while (stack.length) {
      let node = stack.shift()
      if (node[type] === keyword) {
        return node
      }
      if (node.nodes) {
        for (let i = 0, l = node.nodes.length; i < l; i++) {
          stack.push(node.nodes[i])
        }
      }
    }

    return null
  }

  searchByAbsolutePath(keyword) {
    return this._basicSearch('abosultePath', keyword)
  }

  searchByRelativePath(keyword) {
    return this._basicSearch('relativePath', keyword)
  }

  searchByNodeName(keyword) {
    return this._basicSearch('nodeName', keyword)
  }

}
