import downloadGitRepo from 'download-git-repo'
import downloadNpmPkg from 'download-npm-package'
import path from 'path'
import fs from 'fs-extra'

export default function POZDownloader(pozPackage, timeout) {

  const { origin, packageName, requestName, cachePath } = pozPackage

  if (origin === 'npm') {
    return downloadNpmPkg({
      arg: packageName,
      dir: cachePath
    }).then(() => {
      // downloadNpmPkg will download to sub directory by default
      // Need to handle
      actualCachePath = path.join(cachePath, packageName)
      return fs.copy(actualCachePath, cachePath).then(() => fs.remove(actualCachePath))
    })

  } else if (origin === 'git') {
    return new Promise((resolve, reject) => {
      downloadGitRepo(requestName, cachePath, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

  } else if (origin === 'git') {
    return fs.copy(requestName, cachePath)

  } else {
    throw Error('Unkown package origin: ' + origin)
  }

}
