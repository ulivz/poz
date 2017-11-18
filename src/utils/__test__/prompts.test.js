import {
  promptsTransformer,
  mockPromptsRunner,
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
      default: 'POZ'
    },
    description: {
      message: 'How would you describe the new project',
      default: `my awesome project`,
      when: answers => answers.name !== 'POZ'
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
      expect(answers.description).toBe(undefined) // skipped
      expect(answers.author).toBe(promptsMetadata.author.default)
    })
  })

  test('promptsRunner - mock value', async () => {
    const promptsMetadata = promptsMetadata2
    const prompts = promptsTransformer(promptsMetadata);
    return mockPromptsRunner(prompts, [
      'poz.js',
      'awesome poz',
      'ULIVZ'
    ]).then(answers => {
      expect(answers.name).toBe('poz.js')
      expect(answers.description).toBe('awesome poz')
      expect(answers.author).toBe('ULIVZ')
    })
  })

})
