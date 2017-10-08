module.exports = {
  extendWebpack(config) {
    config.module
      .rule('compile')
      .test(/\.hbs$/)
      // .include
      // .add('src')
      // .end()
      .use('raw')
      .loader('raw-loader')
  },
  entry: "example/index.js",
  dist: "example/dist",
  homepage: "/"
}
