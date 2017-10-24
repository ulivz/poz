var pkg = require('../package.json')
var string = require('rollup-plugin-string');

module.exports = {
  plugins: [
    string({
      // Required to be specified
      include: '**/*.md',
      // Undefined by default
      exclude: ['node_modules/**']
    })
  ],
  resolve: true,
  exports: 'named',
  moduleName: pkg.name,
  format: 'es,cjs,umd',
  compress: 'cjs,umd',
  banner: {
    name: 'handlebars2',
    version: pkg.version,
    author: pkg.author,
    license: pkg.license,
    year: 2016
  }
}
