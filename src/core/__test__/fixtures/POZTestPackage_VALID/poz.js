module.exports = function (ctx) {

  let lifeCycle = []

  function run(hookname) {
    lifeCycle.push(hookname)
  }

  return {

    dest() {
      return {
        // Since during the test. test program would change the `process.cwd()`.
        // So using `poz.cwd` which is static through the whole life cycle.
        target: ctx.$sourceDir + '/dist',
        rename: {
          '{js}': '.js'
        }
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
