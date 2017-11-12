import {isPathMatch} from '../minimatch'

describe('minimatch', () => {

  test('isPathMatch', () => {
    let pattern = '*.js'
    let path = 'bar.js'
    expect(isPathMatch(path, pattern)).toBe(true)

    pattern = ['*.js', '*.css']
    expect(isPathMatch(path, pattern)).toBe(true)

    pattern = ['*.html', '*.css']
    expect(isPathMatch(path, pattern)).toBe(false)
  })

})
