let fs = require('fs-extra')

// ABC

function readFile() {
  return fs.readFile('index.js', 'utf-8')
    .then(data => {
      if (data.indexOf('ABC') > -1) {
        return Promise.reject('1')
      }
      return data
    })
    .catch(error => {
      console.log('Catch - 1')
      console.log(error)
    })
}


readFile()
  .then(data => {
    console.log('Entry')
    console.log(data)
  })
  .catch(error => {
    console.log('Catch - 2')
    console.log(error)
  })
