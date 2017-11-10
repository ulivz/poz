import {resolve} from '../../utils/path'
import FileNode from '../FileNode'
import DirectoryNode from '../DirectoryNode'

describe('FileNode', () => {

  test('FileNode', () => {
    const TEST_DIR = __dirname + '/fixtures'

    const node = new DirectoryNode(TEST_DIR, __dirname)

    return node.traverse().then(() => {
      console.log(node.searchByNodeName('d.js'))
    })
  })
})
