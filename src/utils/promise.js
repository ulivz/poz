/**
 * A util to wrapper the nodejs-callback-styled (error first) function to return promise
 * Naitve implementation at node 8
 * @param fn
 * @param args
 * @returns {Promise}
 */
export const promisify = function (fn, ...args) {
  return new Promise((resolve, reject) => {
    fn(...args, function (error, result) {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}
