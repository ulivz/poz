import POA from './POA'
import {resolve} from './utils/path'

describe('POA', () => {

  test.only('', () => {
    const ins = new POA(resolve(__dirname, '../../packages/nm'))
    ins.run()
  })

})
