import filex from '../'
import { beautifyJSON } from '../../utils/json'

describe('file-system', () => {

  const SRC_DIR = __dirname + '/fixtures/src'
  const DIST_DIR = __dirname + '/fixtures/dist'
  const node = filex(SRC_DIR)

  test('toJSON', () => {
    return node.traverse().then(() => {
      expect(node.toJSON()).toMatchSnapshot()
    })
  })

  test('flatten', () => {
    expect(node.flatten().map(li => li.basename)).toMatchSnapshot()
  })

  test('ignore', () => {
    node.ignore('d.js')
    console.log(beautifyJSON(node))
  })

  test('rename', () => {
    console.log(node)
    node.nodes[0].rename('NEW')
    console.log(beautifyJSON(node))
  })

  test('dest', () => {
    node.dest(DIST_DIR)
  })

})
