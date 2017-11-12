const POA = require('../dist/poa.common')
const path = require('path')

const prevCwd = process.cwd()

process.chdir(path.resolve(__dirname, 'fixtures'))

const POAInstance = new POA(path.resolve(__dirname, '../packages/bolt-component'))
POAInstance.run()

process.chdir(prevCwd)
