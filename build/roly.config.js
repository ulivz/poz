var pkg = require('../package.json')
var string = require('rollup-plugin-string');

module.exports = [
  {
    plugins: [
      string({
        // Required to be specified
        include: '**/*.md',
        // Undefined by default
        exclude: ['node_modules/**']
      })
    ],
    exports: 'default',
    filename: pkg.name,
    format: 'cjs',
    banner: {
      name: pkg.name.toUpperCase(),
      version: pkg.version,
      author: pkg.author,
      license: pkg.license,
      year: 2016
    }
  }
]
