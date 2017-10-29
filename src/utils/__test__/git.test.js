import {getGitUser} from '../git'

describe('git', () => {
  test('getGitUser', () => {
    const user = getGitUser()
    expect(user.name).toBe('haolchen')
    expect(user.email).toBe('haolchen@ebay.com')
  })
})
