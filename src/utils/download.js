import downloadGitRepo from 'download-git-repo'
import downloadNpmPkg from 'download-npm-package'
import path from 'path'
import fs from 'fs-extra'

const NPM_REG = /^[a-zA-Z0-9@\-]+$/
const GIT_REG = /^[a-zA-Z0-9\/\-]+$/
const NEED_CLONE_REG = /(bitbucket|gitlab|https?)/

/**
 * Download package from Github / NPM / Gitlab / bitbucket
 * @param url {string}
 * @param target {string}
 * @param newfolder {boolean}
 * @returns Promise<{packageName: string, npm?: boolean, git?: boolean}>
 */
export function download(url, target, options = { newfolder: true }) {

  if (NPM_REG.test(url)) {
    return downloadNpmPkg({
      arg: url,
      dir: target
    }).then(() => {
      // Since downloadNpmPkg will download to 'target/url' by default
      // Need to handle when 'newfolder' is false
      if (!options.newfolder) {
        return fs.copy(actualDestPath, target).then(() => fs.remove(actualDestPath))
      }
    }).then(() => ({
      packageName: url,
      npm: true,
      path: options.newfolder ? path.join(target, url) : target
    }))

  } else if (GIT_REG.test(url)) {
    return new Promise((resolve, reject) => {
      let packageName = url.split('/').pop()
      if (options.newfolder) {
        target = path.join(target, packageName)
      }
      let args = [url, target]
      if (NEED_CLONE_REG.test(url)) {
        args.push({ clone: true })
      }
      downloadGitRepo(...args, err => {
        if (err) {
          reject(err)
        } else {
          resolve({
            packageName,
            git: true,
            path: options.newfolder ? path.join(target) : target
          })
        }
      })
    })

  } else {
    throw Error('Invalid URL')
  }
}
