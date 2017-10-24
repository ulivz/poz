import fs from 'fs'
import path from 'path'
import components from '../src'
import pj from '../package.json'
const { Readme, Pkg, License } = components
// const prevCwd = process.cwd()

function Promisify(fn, ...args) {
  return new Promise(resolve => {
    resolve(fn && fn(...args))
  })
}

function cwd(filePath) {
  return path.join(__dirname, filePath || '')
}

function saveTemplate(component) {
  fs.writeFileSync(cwd(`fixtures/${component.config.__name__}`), component.render(), 'utf-8')
}

// beforeAll(() => {
//   process.chdir(__dirname)
// })
//
// afterAll(() => {
//   process.chdir(prevCwd)
// })

describe('component', () => {

  test('readme', () => {
    const config = {
      name: pj.name,
      username: 'ulivz',
      author: {
        name: 'ULIVZ',
        website: 'http://v2js.com'
      },
      description: pj.description
    }
    const readme = new Readme(config)
    saveTemplate(readme)
  })

  test('pkg', () => {
    const config = {
      name: 'poa',
      description: pj.description,
      username: 'ulivz',
      email: 'chl814@foxmail.com',
      compile: true,
      cli: true,
      ut: true,
      eslint: 'xo',
      poi: true,
      nodeVersion: 4,
    }
    const pkg = new Pkg(config)
    saveTemplate(pkg)
  })

  test('license', () => {
    const config = {
      username: 'ulivz',
      email: 'chl814@foxmail.com'
    }
    const license = new License(config)
    saveTemplate(license)
  })

})

