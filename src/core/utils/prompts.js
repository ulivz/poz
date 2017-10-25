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


export function mockPromptRunner(prompts, promptsAnswers) {
  const promptsPromise = promptsRunner(prompts)
  const ui = promptsPromise.ui
  let idx = 0;
  ui.process.subscribe(() => {
    // Use setTimeout because async properties on the following question object will still
    // be processed when we receive the subscribe event.
    process.nextTick(() => {
      ui.rl.emit('line', promptsAnswers && promptsAnswers[idx++])
    })
  })
  ui.rl.emit('line', promptsAnswers && promptsAnswers[idx++])
  return promptsPromise
}
