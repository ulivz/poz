import POA from '../src/core/POA'
import path from 'path'

const ins = new POA(path.resolve(__dirname, '../packages/nm'))
ins.run()
