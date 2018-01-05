import POZX from '../../pozx/POZX'

describe('POZX', () => {

  test('POZX test', async () => {
    let app = new POZX()

    app.task('task1', (scope) => {
      scope.task1 = true
      let r = []
      for (let i = 0, l = 10000000; i < l; i++) {
        r.push(i)
      }
    })

    app.task('task2', (scope) => {
      scope.task2 = true
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    })

    app.subscribe('*', (name, duration, scope) => {
      console.log('DEBUG: ' + name, duration + 'ms')
    })

    app.go()
  })

})


