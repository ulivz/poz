import {getGitUser} from '../git'

describe('git', () => {
  test('getGitUser', () => {
    const user = getGitUser()
    if (process.env.DEV_ENV === 'local') {
      expect(user.name).toBe('haolchen')
      expect(user.email).toBe('haolchen@ebay.com')

    } else {
      expect(user.name).toBe('')
      expect(user.email).toBe('')
    }
  })
})
