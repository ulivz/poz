var pkg = require('../package.json')

module.exports = {
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
