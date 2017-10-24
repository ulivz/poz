module.exports = function (ctx, poa) {

  return {

    before() {
      // override
      poa.set({
        'gituser': 'ulivz',
        'gitemail': 'chl814@foxmail.com'
      })
    },

    prompts() {
      return {
        name: {
          message: 'What is the name of the new project',
          default: ctx.dirname
        },
        description: {
          message: 'How would you describe the new project',
          default: `my awesome project`
        },
        author: {
          message: 'What is your name',
          default: ctx.gituser,
          store: true
        },
        username: {
          message: 'What is your GitHub username',
          default: ctx.gituser,
          store: true
        },
        email: {
          message: 'What is your GitHub email',
          default: ctx.gitemail,
          store: true,
          validate: v => /.+@.+/.test(v)
        },
        website: {
          message: 'What is the url of your website',
          default(answers) {
            return `https://github.com/${answers.username}`
          },
          store: true
        },
        pm: {
          message: 'Choose a package manager',
          choices: ['npm5', 'yarn'],
          type: 'list',
          default: 'npm5'
        },
        unitTest: {
          message: 'Do you need unit test?',
          type: 'confirm',
          default: false
        },
        coverage: {
          message: 'Do you want to add test coverage support?',
          type: 'confirm',
          default: false,
          when: answers => answers.unitTest
        },
        eslint: {
          message: 'Choose an eslint tool',
          type: 'list',
          default: 'xo',
          choices: ['xo', 'standard', 'disable']
        },
        compile: {
          message: 'Do you need to compile ES2015 code?',
          type: 'confirm',
          default: false
        },
        poi: {
          type: 'confirm',
          default: false,
          message: 'Use egoist/poi to run and build example',
          when: answers => answers.compile
        },
        cli: {
          message: 'Do you want to add a CLI?',
          type: 'confirm',
          default: false,
          when: answers => !answers.compile
        },
        twitter: {
          message: 'What is your twitter username?',
          store: true
        }
      }
    },

    after() {
      // We keep `.gitignore` as `gitignore` in the project
      // Because when it's published to npm
      // `.gitignore` file will be ignored!
      poa.rename({
        gitignore: '.gitignore'
      })

      if (ctx.pm === 'yarn') {
        poa.yarnInstall()
      } else {
        poa.npmInstall()
      }
    }

  }

}
