import fs from 'fs'
import PATH from 'path'
import POZFileTreeNode from './POZFileTreeNode'
import {dest} from './POZFileTreeNode'
import POZFile from './POZFile'
import {isFile} from '../utils/fs'
import {isString, isArray, isPlainObject, isFunction} from '../utils/datatypes'

export default class POZDirectory extends POZFileTreeNode {

  constructor(path, cwd) {
    if (!cwd) {
      cwd = path
    }
    super(path, cwd)
    this.isDirectory = true
    this.nodes = this.childNodes = []
    this.isTraversed = false
    this.src = [this.path + '/**']
  }

  _reversePattern(pattern) {
    return '!' + this.path + '/' + pattern
  }

  setDestIgnore(pattern) {
    let reversePattern = this._reversePattern.bind(this)

    if (isString(pattern)) {
      this.src.push(reversePattern(pattern))

    } else if (isArray(pattern)) {
      this.src = this.src.concat(pattern.map(i => reversePattern(i)))

    } else if (isPlainObject(pattern)) {
      Object.keys(pattern).forEach(i => {
        let condition = pattern[i]
        if (isFunction(condition) && condition()) {
          this.src.push(reversePattern(i))
        } else if (pattern[i]) {
          this.src.push(reversePattern(i))
        }
      })
    }
  }

  dest(targetPath, transformer) {
    return dest(this.src, targetPath, transformer)
  }

  traverse() {
    return this.recursiveTraverse().then(() => {
      this.isTraversed = true;
    }).catch(error => {
      console.log(error)
    })
  }

  recursiveTraverse() {
    if (this.isTraversed) {
      return Promise.resolve()
    }

    let parentNode = this

    return new Promise((resolve, reject) => {
      fs.readdir(parentNode.path, (error, childNodeNames) => {
        if (error) {
          reject(error)
        }
        let traverseChildNodesPromises = []

        for (let childNodeName of childNodeNames) {
          let childNodePath = PATH.resolve(parentNode.path, childNodeName)
          let isChildNodeFile = isFile(childNodePath)
          let ChildNodeConstructor = isChildNodeFile ? POZFile : POZDirectory
          let childNode = new ChildNodeConstructor(childNodePath, parentNode.path)

          childNode.parentNode = parentNode
          parentNode.childNodes.push(childNode)

          if (childNode instanceof POZDirectory) {
            traverseChildNodesPromises.push(
              childNode.recursiveTraverse().then(() => {
                childNode.isTraversed = true;
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

  findByPath(path) {
    return this._basicSearch('path', path)
  }

  findByRelative(relative) {
    return this._basicSearch('relative', relative)
  }

  findByBasename(keyword) {
    return this._basicSearch('basename', keyword)
  }

}
