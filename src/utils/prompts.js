import inquirer from 'inquirer'
import {isFunction} from './datatypes'
import {info} from './log'

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

export function promptsRunner(prompts) {
  return inquirer.prompt(prompts)
}

export function mockPromptsRunner(prompts, promptsAnswers) {
  const promptsPromise = promptsRunner(prompts)
  const ui = promptsPromise.ui
  let idx = 0;
  ui.process.subscribe(() => {
    // Use setTimeout because async properties on the following question object will still
    // be processed when we receive the subscribe event.
    setTimeout(() => {
      ui.rl.emit('line', promptsAnswers && promptsAnswers[idx++])
    }, 5)
  })
  ui.rl.emit('line', promptsAnswers && promptsAnswers[idx++])
  return promptsPromise
}


export function progressivePromptsRunner(prompts) {
  const anwsers = {}
  let idx = 0
  const getCurrentPrompt = () => prompts[idx]
  const getPromptPromise = () => inquirer.prompt(prompts[idx])
  const checkIfSkipCurrentPrompt = () => {
    let currentPrompt = getCurrentPrompt()
    if (currentPrompt && currentPrompt.when && isFunction(currentPrompt.when)) {
      if (!currentPrompt.when(anwsers)) {
        info(`skip prompt: <yellow>${currentPrompt.name}</yellow>`)
        idx++
        checkIfSkipCurrentPrompt()
      }
    }
  }
  const cacheAnswer = newAnswers => {
    let name = Object.keys(newAnswers)[0]
    anwsers[name] = newAnswers[name]
  }

  const handleAnswer = newAnswers => {
    cacheAnswer(newAnswers)
    idx++
    checkIfSkipCurrentPrompt()
    if (getCurrentPrompt()) {
      return getPromptPromise().then(handleAnswer)
    }
    return anwsers
  }

  return getPromptPromise().then(handleAnswer)
}
