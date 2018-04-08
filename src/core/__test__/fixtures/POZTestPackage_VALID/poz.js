module.exports = function (ctx) {

  let lifeCycle = []

  function run(hookname) {
    lifeCycle.push(hookname)
  }

  return {

    get target() {
      return ctx.dirpath + '/dist'
    },

    get rename() {
      return {
        '{js}': '.js'
      }
    },

    prompts() {
      return {
        name: {
          message: "What's your project name",
          default: ctx.dirname
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

    onStart() {
      run('onStart')
    },

    onPromptStart() {
      run('onPromptStart')
    },

    onPromptEnd() {
      run('onPromptEnd')
    },

    onDestStart() {
      run('onDestStart')

    },
    onDestEnd() {
      run('onDestEnd')
    },

    onExit() {
      run('onExit')
      ctx.set('calledLifeCycle', lifeCycle)
    }
  }

}
