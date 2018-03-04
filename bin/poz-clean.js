'use strict';

const { POZ, PackageManager } = require('../dist/poz.cjs')
const { logger, prompts } = POZ.utils

module.exports = function (cli) {

  return {
    command: {
      name: 'clean',
      opts: {
        desc: 'Clean local cache',
      },
      handler: function (input, flags) {
        return prompts.prompt({
          cleanAllConfirm: {
            message: logger.promptsLogger.warnStyle('All local data will be lost, sure to continue?'),
            type: 'confirm'
          }
        }).then((answers) => {
          if (answers.cleanAllConfirm) {
            let pm = new PackageManager()
            pm.cache.cleanCache()
          } else {
            logger.redSnow(`Cancelled`)
          }
        })
      },
    },
    options: []
  }

}
