import components from '../../components'

module.exports = [
  {
    type: 'd',
    name: 'example',
    content: [
      {
        type: 'f',
        name: 'index.js',
        content: '<index.js>'
      }
    ]
  },
  {
    type: 'd',
    name: 'src',
    content: [
      {
        type: 'f',
        name: 'index.js',
        content: '<index.js>'
      }
    ]
  },
  {
    type: 'f',
    name: '.gitignore',
    content: '<gitignore>'
  },
  {
    type: 'f',
    content: components.License
  },
  {
    type: 'f',
    content: components.Readme
  },
]
