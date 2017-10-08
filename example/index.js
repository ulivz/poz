import components from '../src'

const readme = new components.Readme({
  name: 'handlebars2',
  username: 'ulivz',
  author: {
    name: 'ULIVZ',
    website: 'http://v2js.com'
  },
  description: 'a project patcher'
})

console.log({ str: readme.render() })
console.log(readme.render())
const monut = function (el) {
  const appEl = document.getElementById('app')
  appEl.innerHTML = el
}

monut(`<code><pre>${readme.render()}</pre><code>`)
