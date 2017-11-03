import VFS from 'vinyl-fs'
import map from 'map-stream'
import {isString, isPlainObject} from './datatypes'
import {success, error, echo} from './log'
import {render} from './render'
import {relative} from './path'

/**
 * Generate
 * @param sourceDir {string}
 * @param targetDir {string}
 * @param options {object}
 * @returns {Promise}
 */
export function generate(sourceDir, targetDir, options) {

  if (!isString(sourceDir)) {
    throw new Error('Expected "sourceDir" to be string')
  }
  if (!isString(targetDir)) {
    throw new Error('Expected "targetDir" to be string')
  }
  if (options && !isPlainObject(options)) {
    options = { context: options, render: true }
  }

  let globs = [sourceDir + '/**']
  return new Promise(resolve => {
    VFS.src(globs)
      .pipe(map((file, cb) => {
        // render file by context
        if (options.render) {

          if (!file.isDirectory()) {
            let res = render(file.contents.toString(), options.context)
            let filePath = relative(sourceDir, file.path)

            if (res.status === 200) {
              success(`render <cyan>${filePath}</cyan>`)
              file.contents = new Buffer(res.out)
            } else {
              error(`render <red>${filePath}</red>`)
              echo(res.error)
            }
          }
        }
        cb(null, file)
      }))
      .pipe(VFS.dest(targetDir))
      .on('finish', resolve)
  })
}
