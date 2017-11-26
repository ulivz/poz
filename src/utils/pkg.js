import {exists, isFile} from './fs'
import {resolve} from './path'

export function getPkg(baseDir) {
  const pkgPath = resolve(baseDir || process.cwd(), 'package.json')
  if (!exists(pkgPath) || !isFile(pkgPath))
    return {}
  return require(pkgPath)
}
