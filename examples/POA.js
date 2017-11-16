const POA = require('../dist/poa.common')
const path = require('path')

const prevCwd = process.cwd()

process.chdir(path.resolve(__dirname, 'fixtures'))

// const POAInstance = new POA(path.resolve(__dirname, '../packages/bolt-component'))
const POAInstance = new POA(path.resolve(__dirname, '../src/core/__test__/fixtures/POATestPackage'))
POAInstance.start()

process.chdir(prevCwd)
