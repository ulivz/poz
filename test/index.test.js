import components from '../src'
const { Readme } = components

function Promisify(fn, ...args) {
  return new Promise(resolve => {
    resolve(fn && fn(...args))
  })
}

const prevCwd = process.cwd()

beforeAll(() => {
  process.chdir(__dirname)
})

afterAll(() => {
  rm.sync(cwd('dist*'))
  process.chdir(prevCwd)
})

test('readme', () => {
  const config = {
    name: 'handlebars2',
    username: 'ulivz',
    author: {
      name: 'ULIVZ',
      website: 'http://v2js.com'
    },
    description: 'a project patcher'
  }
  console.log(Readme.create(config))
  // expect(typeof aProjectPatcher).toBe('function')
})
