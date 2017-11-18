module.exports = function (ctx, poz) {

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
          default: 'POZ',
        }
      }
    },

    onExit() {
      poz.util.logger.info('finished')
      poz.printTree()
    }
  }

}
