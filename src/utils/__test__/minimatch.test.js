import {match} from '../minimatch'

describe('minimatch', () => {

  test('match', () => {
    let pattern = '*.js'
    let path = 'bar.js'
    expect(match(path, pattern)).toBe(true)

    pattern = ['*.js', '*.css']
    expect(match(path, pattern)).toBe(true)

    pattern = ['*.html', '*.css']
    expect(match(path, pattern)).toBe(false)

    pattern = ['README*']
    path = 'README.md'
    expect(match(path, pattern)).toBe(true)

    pattern = ['!README*']
    expect(match(path, pattern)).toBe(false)
  })

})
