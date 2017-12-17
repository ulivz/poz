import { parseRequest } from '../POZPackageManager'

describe('parseRequest', () => {

  test('should parse Git Repo correctly', async () => {
    const { origin, packageName } = parseRequest('ulivz/my-first-poz')
    expect(origin).toBe('git')
    expect(packageName).toBe('my-first-poz')
  })

  test('should parse Git Repo correctly', async () => {
    const { origin, packageName } = parseRequest('n')
    expect(origin).toBe('npm')
    expect(packageName).toBe('n')
  })
})
