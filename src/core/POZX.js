import { isPromise } from '../utils/datatypes'

class POZX {
  constructor() {
    this.quene = []
    this.queneMap = {}
    this.scope = {}
    this.globalSubscribers = []
  }

  task(name, handler) {
    let task = {
      name,
      handler,
      subscribers: []
    }
    this.queneMap[name] = task
    this.quene.push(task)
  }

  subscribe(name, subscriber) {
    if (this.queneMap[name]) {
      this.queneMap[name].subscribers.push(subscriber)
    } else if (name === '*') {
      this.globalSubscribers.push(subscriber)
    }
  }

  async go() {
    while (this.quene.length) {
      let task = this.quene.shift()
      let scope

      let start = Date.now()
      const result = task.handler(scope = this.scope[task.name] = {})
      if (isPromise(result)) {
        await result
      }
      let end = Date.now()
      while (task.subscribers.length) {
        let subscriber = task.subscribers.shift()
        subscriber(task.name, scope)
      }

      for (let subscriber of this.globalSubscribers) {
        subscriber(task.name, (end - start) / 1000, scope)
      }
    }
  }
}

let app = new POZX()

app.task('task1', (scope) => {
  scope.task1 = true
  let r = []
  for (let i = 0, l = 10000000; i < l; i++) {
    r.push(i)
  }
})

app
  .task('task2', (scope) => {
    scope.task2 = true
  })
  .catch(error => {

  })

app.subscribe('*', (name, duration, scope) => {
  console.log('DEBUG: ' + name, duration + 'ms')
})

app.go()
