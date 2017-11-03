export const POA_ENV_TEST =
  process.env.BABEL_ENV === 'test' ||
  process.env.NODE_ENV === 'test'


export const POA_ENV_DEBUG =
  process.env.BABEL_ENV === 'debug' ||
  process.env.NODE_ENV === 'debug'
