import POA from './POA'
import {resolve} from './utils/path'

describe('POA', () => {

  test('base', () => {
    const ins = new POA(resolve(__dirname, '../../packages/nm'))
    ins.run()
  })

})
