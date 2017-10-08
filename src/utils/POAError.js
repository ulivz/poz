export default class POAError extends Error {

  constructor(msg) {
    super(msg)
    this.name = this.constructor.name
  }

}
