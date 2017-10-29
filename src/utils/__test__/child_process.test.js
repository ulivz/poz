import {exec, execSync} from '../child_process'

describe('child_process', () => {

  test('exec', () => {
    return exec('echo 123', { slient: true }).then(({ stdout }) => {
      expect(stdout.trim()).toBe('123')
    })
  })

  test('execSync', () => {
    let stdout = execSync('echo 123')
    expect(stdout.trim()).toBe('123')
  })

})
