const POZ = require('../dist/poz.common')
const path = require('path')

const prevCwd = process.cwd()

process.chdir(path.resolve(__dirname, 'fixtures'))

const POZInstance = new POZ(path.resolve(__dirname, '../packages/bolt-component'))
// const POZInstance = new POZ(path.resolve(__dirname, '../src/core/__test__/fixtures/POZTestPackage'))
POZInstance.start()

process.chdir(prevCwd)
