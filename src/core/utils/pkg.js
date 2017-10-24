import path from 'path'
import {exists, isFile} from './fs'
import {resolve} from './path'

export function getPkg() {
  const pkgPath = resolve(process.cwd(), 'package.json')
  if (!exists(pkgPath) || !isFile(pkgPath))
    return null
  return require(pkgPath)
}
