import handlebar2 from 'handlebars2'

export function render(template, context) {
  let result, status, error
  try {
    result = handlebar2.render(template, context)
    status = 200
  } catch (err) {
    error = err
    status = 500
  }
  return { result, status, error }
}
