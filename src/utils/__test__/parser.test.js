import {simpleStringParser} from '../parser'

describe('parser', () => {

  const reg = /{{[^{}]*}}/g
  const reg2 = /{{([^{}]*)}}/g
  const str = 'a{{b}}c{{d}}e'

  test('simpleStringParser - should return the raw string when no onMatch handler', () => {
    const result = simpleStringParser(str, { reg })
    expect(result).toBe(str)
  })

  test('simpleStringParser - no group', () => {
    const result = simpleStringParser(str, {
      reg,
      onMatch(...match) {
        return '$' + match[0]
      }
    })
    expect(result).toBe('a${{b}}c${{d}}e')
  })

  test('simpleStringParser - with group', () => {
    const result = simpleStringParser(str, {
      reg: reg2,
      onMatch(...match) {
        return match[1]
      }
    })
    expect(result).toBe('abcde')
  })

})
