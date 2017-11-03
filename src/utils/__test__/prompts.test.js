import {
  promptsTransformer,
  mockPromptsRunner,
  progressivePromptsRunner,
} from '../prompts'

describe('prompts', () => {

  const promptsMetadata1 = {
    name: {
      type: 'checkbox'
    },
    description: {
      message: 'description'
    }
  }

  const promptsMetadata2 = {
    name: {
      message: 'What is the name of the new project',
      default: 'POA'
    },
    description: {
      message: 'How would you describe the new project',
      default: `my awesome project`,
      when: answers => answers.name !== 'POA'
    },
    author: {
      message: 'What is your name',
      default: 'ulivz',
    }
  }

  test('promptsTransformer', () => {
    const promptsMetadata = promptsMetadata1
    const prompts = promptsTransformer(promptsMetadata);
    expect(prompts.length).toBe(2)
    let [namePrompt, descriptionPrompt] = prompts;
    expect(namePrompt.name).toBe('name')
    expect(namePrompt.type).toBe('checkbox')
    expect(descriptionPrompt.name).toBe('description')
    expect(descriptionPrompt.message).toBe('description')
  })

  test('promptsRunner - default value', async () => {
    const promptsMetadata = promptsMetadata2
    const prompts = promptsTransformer(promptsMetadata);
    return mockPromptsRunner(prompts).then(answers => {
      expect(answers.name).toBe(promptsMetadata.name.default)
      expect(answers.description).toBe(promptsMetadata.description.default)
      expect(answers.author).toBe(promptsMetadata.author.default)
    })
  })

  test('promptsRunner - mock value', async () => {
    const promptsMetadata = promptsMetadata2
    const prompts = promptsTransformer(promptsMetadata);
    return mockPromptsRunner(prompts, [
      'poa.js',
      'awesome poa',
      'ULIVZ'
    ]).then(answers => {
      expect(answers.name).toBe('poa.js')
      expect(answers.description).toBe('awesome poa')
      expect(answers.author).toBe('ULIVZ')
    })
  })

  test.only('progressivePromptsRunner', async () => {
    const promptsMetadata = promptsMetadata2
    const prompts = promptsTransformer(promptsMetadata);
    return progressivePromptsRunner(prompts, [
      'poa.js',
      'awesome poa',
      'ULIVZ'
    ]).then(answers => {
      console.log(answers)
    })
  })




})
