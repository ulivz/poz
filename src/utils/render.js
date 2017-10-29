import handlebar2 from 'handlebars2'
import {statusWrapper} from './wrapper'

export function render(template, context) {
  return statusWrapper(
    handlebar2.render,
    template,
    context
  )
}
