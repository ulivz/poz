import { PackageManager } from '../index'
import { logger, prompts } from '../utils/index'

export default function (cli) {

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
