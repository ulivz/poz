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
            message: `${logger.__.warn(' WARNING ')} All local data will lost, are you sure that you want to clean all local cache?`,
            type: 'confirm'
          }
        }).then((answers) => {
          if (answers.cleanAllConfirm) {
            let pm = cli.pm()
            pm.cleanAllCache()
          }
        })
      },
    },
    options: []
  }

}
