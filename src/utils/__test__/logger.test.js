import logger from '../logger'

describe('log', () => {

  test('success', () => {
    const msg = 'compile file index.js successfully'
    logger.success(msg)
  })


  test('error', () => {
    const msg = 'fail to compile file index.js'
    logger.error(msg)
  })

  test('warning', () => {
    const msg = 'file index.js might contains some unknown characters'
    logger.warn(msg)
  })

  test('info', () => {
    const msg = 'file index.js is cool'
    logger.info(msg)
  })

  test('debug', () => {
    const msg = 'file index.js is cool'
    logger.debug(msg)
  })

  test('print', () => {
    const msg = 'file index.js is cool'
    logger.print(msg)
  })

  test('table', () => {
    logger.table({
      a: 1,
      b: 2
    })
  })

})
