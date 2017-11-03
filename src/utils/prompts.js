import inquirer from 'inquirer'
import {isFunction} from './datatypes'
import {info} from './log'
import {POA_ENV_TEST} from './env'

/**
 * Transform prompts metadata to standard prompt data structrue
 * @param promptsMetadata {Object}
 * @returns {Array}
 */
export function promptsTransformer(promptsMetadata) {
  let prompts = []
  for (let promptName of Object.keys(promptsMetadata)) {
    prompts.push(Object.assign({
        name: promptName
      }, promptsMetadata[promptName])
    )
  }
  return prompts
}

/**
 * Official prompts runner
 * @param prompts {Array} standard prompt data
 * @returns {Promise} the resolved data is a object contains all answers
 */
export function promptsRunner(prompts) {
  return inquirer.prompt(prompts)
}


function _mockAnswerByPromptPromise(promptPromise, answers) {
  const ui = promptPromise.ui
  let idx = 0
  ui.process.subscribe(() => {
    // Use setTimeout because async properties on the following question object will still
    // be processed when we receive the subscribe event.
    setTimeout(() => {
      ui.rl.emit('line', answers && answers[idx++])
    }, 5)
  })
  ui.rl.emit('line', answers && answers[idx++])
}

/**
 * Mock official prompts runner
 * @param prompts {Array} standard prompt data
 * @param promptsAnswers {Array} every prompt's answer in order
 * @returns {Promise}
 */
export function mockPromptsRunner(prompts, promptsAnswers) {
  const promptsPromise = promptsRunner(prompts)
  _mockAnswerByPromptPromise(promptsPromise, promptsAnswers)
  return promptsPromise
}
