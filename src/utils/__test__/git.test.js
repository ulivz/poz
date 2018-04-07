import { getGitUser } from '../git'

describe('git', () => {
  test('getGitUser', () => {
    const user = getGitUser()
    expect(user).not.toBe(undefined)
  })
})
