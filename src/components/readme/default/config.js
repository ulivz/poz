export default {
  __type__: 'md',
  __name__: 'README.md',
  __start__: '```handlebars',
  __end__: '```',
  username: null, // Required
  name: null, // Require
  contributing: true,
  badges: {
    version: true,
    downloads: true,
    ci: true,
    coverage: true
  },
  install: {
    yarn: true,
    npm: true
  }
}
