import POAFile from '../POAFile'
import POADirectory from '../POADirectory'

describe('FileNode', () => {

  test('FileNode', () => {
    const TEST_DIR = __dirname + '/fixtures'
    const node = new POADirectory(TEST_DIR, __dirname)
    return node.traverse().then(() => {
      console.log('finished')
    })
  })
})
