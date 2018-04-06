import logger from '../logger'

describe('log', () => {

  test('success', () => {
    const msg = 'compile file POZX.js successfully'
    logger.success(msg)
  })


  test('error', () => {
    const msg = 'fail to compile file POZX.js'
    logger.error(msg)
  })

  test('warning', () => {
    const msg = 'file POZX.js might contains some unknown characters'
    logger.warn(msg)
  })

  test('info', () => {
    const msg = 'file POZX.js is cool'
    logger.info(msg)
  })

  test('debug', () => {
    const msg = 'file POZX.js is cool'
    logger.debug(msg)
  })

  test('table', () => {
    logger.table({
      a: 1,
      b: 2
    })
  })

})
