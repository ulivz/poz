import inquirer from 'inquirer'

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
