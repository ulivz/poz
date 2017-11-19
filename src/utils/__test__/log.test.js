import {
  COLOR,
  simplelogMsgParser,
  success,
  error,
  warn,
  info
} from '../logger'

describe('log', () => {

  test('simplelogMsgParser - simple', () => {
    const msg = '<red>POZ</red>'
    expect(simplelogMsgParser(msg)).toBe(COLOR.red('POZ'))
  })

  test('simplelogMsgParser - complex', () => {
    const msg = '<red>POZ</red>POZ<cyan>POZ</cyan>'
    expect(simplelogMsgParser(msg)).toBe(
      COLOR.red('POZ') + 'POZ' + COLOR.cyan('POZ')
    )
  })

  // Now logger does not support nested structure
  // TODO support nested color
  test('simplelogMsgParser - complex', () => {
    const msg = '<white><red>POZ</red>POZ<cyan>POZ</cyan></white>'
    expect(simplelogMsgParser(msg)).toBe(
      '<white>' + COLOR.red('POZ') + 'POZ' + COLOR.cyan('POZ') + '</white>'
    )
  })

  test('success', () => {
    const msg = 'compile file <cyan>index.js</cyan> successfully'
    success(msg)
  })


  test('error', () => {
    const msg = 'fail to compile file <magenta>index.js</magenta>'
    error(msg)
  })

  test('warning', () => {
    const msg = 'file <green>index.js</green> might contains some <red>unknown</red> characters'
    warn(msg)
  })

  test('info', () => {
    const msg = 'file <blue>index.js</blue> is cool'
    info(msg)
  })

})
