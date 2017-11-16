module.exports = function (ctx, poa) {

  return {

    dest: {
      target: 'dist',
      rename: {
        '{js}': '.js'
      }
    },

    prompts() {
      return {
        name: {
          message: "What's your project name",
          default: ctx.$dirname
        },
        description: {
          message: 'How would you describe your project',
          default: `my awesome project`
        },
        author: {
          message: "What's your name",
          default: 'POA',
        }
      }
    },

    onDestEnd() {
      poa.util.logger.info('finished')
    },

    onExit() {
      poa.util.logger.info('finished')
      poa.printTree()
    }
  }

}
