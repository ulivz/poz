import {render} from './render'

describe('render', () => {

  test('render', () => {
    const template = '{{ a }}'
    const context = { a: 1 }
    const result = render(template, context)
    expect(result.status).toBe(200)
    expect(result.result).toBe('1')
    expect(result.error).toBe(undefined)
  })

  test('render - error', () => {
    const template = '{{#if }}{{#if }} {{a}} {{/if}}'
    const context = { a: 1 }
    const result = render(template, context)
    expect(result.status).toBe(500)
    expect(result.error).not.toBe(undefined)
  })

})
