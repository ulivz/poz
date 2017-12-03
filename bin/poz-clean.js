'use strict';

module.exports = function (cli, POZ) {
  const { logger, prompts } = POZ.utils



  return {
    command: {
      name: 'clean',
      opts: {
        desc: 'Clean local cache',
      },
      handler: function (input, flags) {
        return prompts.prompt({
          cleanAllConfirm: {
            message: PromptLogger.warn('All local data will be lost, sure to continue?'),
            type: 'confirm'
          }
        }).then((answers) => {
          if (answers.cleanAllConfirm) {
            let pm = cli.pm()
            pm.cleanAllCache()
          } else {
            logger.info(`Cancelled`)
          }
        })
      },
    },
    options: []
  }

}
