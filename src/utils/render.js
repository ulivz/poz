import {statusWrapper} from './wrapper'

export function render(template, context) {
  return statusWrapper(
    handlebar2.render,
    template,
    context
  )
}
