import fs from './fs'
import { resolve } from './path'

export function getPkg(baseDir) {
  const pkgPath = resolve(baseDir || process.cwd(), 'package.json')
  if (!fs.existsSync(pkgPath) || !fs.isFile(pkgPath))
    return {}
  return require(pkgPath)
}
