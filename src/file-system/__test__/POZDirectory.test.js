import POZFile from '../POZFile'
import POZDirectory from '../POZDirectory'

describe('FileNode', () => {

  test('FileNode', () => {
    const TEST_DIR = __dirname + '/fixtures'
    const node = new POZDirectory(TEST_DIR, __dirname)
    return node.traverse().then(() => {

    })
  })
})
