import fs from 'fs-extra'
import path from 'path'
import Node from './node'
import File from './file-node'
import { isFile } from '../utils/fs'
import { match } from '../utils/minimatch'
import { isString, isArray, isPlainObject, isFunction } from '../utils/datatypes'

function getChildNode(childNodeName, parentNode) {
  let childNodePath = path.resolve(parentNode.path, childNodeName)
  let isChildNodeFile = isFile(childNodePath)
  let ChildNodeConstructor = isChildNodeFile ? File : Directory
  return new ChildNodeConstructor(childNodePath, parentNode.cwd)
}


export default class Directory extends Node {

  constructor(path, cwd) {
    if (!cwd) {
      cwd = path
    }
    super(path, cwd)

    this.isDirectory = true
    this.nodes = []
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

  /**
   * Recursive traverse
   */
  traverse() {
    if (this.isTraversed) {
      return Promise.resolve()
    }

    const childNodeNames = fs.readdirSync(this.path)
    this.nodes = childNodeNames
      .map(childNodeName =>
        getChildNode(childNodeName, this)
      )

    const promises = this.nodes
      .filter(childNode => childNode.isDirectory)
      .map(childNode => childNode.traverse())

    return Promise.all(promises)
      .then(() => {
        this.isTraversed = true
      })
  }

  /**
   * Get json object
   */
  toJSON() {
    return {
      ...this._toJSON(),
      nodes: this.nodes.map(childNode => childNode.toJSON())
    }
  }

  children() {
    return this.nodes
  }

  siblings() {
    return this.parentNode.nodes
      .filter(childNode => childNode !== this)
  }

  flatten() {
    let result = []
    this.nodes
      .forEach(childNode => {
        result.push(childNode)
        if (childNode.nodes) {
          result.push(...childNode.flatten())
        }
      })
    return result
  }

  each(handler) {
    if (!isFunction(handler)) {
      return
    }
    this.nodes.forEach(childNode => {
      handler(childNode)
      if (childNode.nodes) {
        childNode.each(handler)
      }
    })
  }

  ignore(ignore) {
    this.each((node => {
      if (match(node.relative, ignore)) {
        node.__IGNORED__ = true
        console.log(node)
      }
    }))
  }

  setpath(newpath) {
    this.path = newpath
    this.nodes.forEach(node => {
      const childNewpath = path.join(this.path, node.basename)
      node.setpath(childNewpath)
    })
  }

  dest(distDir, { newDir } = {}) {
    fs.ensureDirSync(distDir)
    if (newDir) {
      distDir = path.join(distDir, this.basename)
    }
    for (let childNode of this.nodes) {
      const { __IGNORED__, isDirectory, relative, originalPath } = childNode
      if (__IGNORED__) {
        console.log('Ignore: ' + childNode.relative)
      } else {
        if (isDirectory) {
          fs.ensureDirSync(path.join(distDir, relative))
          childNode.dest(distDir)
        } else {
          fs.copySync(originalPath, path.join(distDir, relative))
        }
      }
    }
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
