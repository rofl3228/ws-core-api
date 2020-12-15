class ActionControllerError extends Error {
  constructor(message) {
    super(message);
  }

  toString() {
    return `${this.constructor.name}: ${this.message}`;
  }
}

module.exports = ActionControllerError;
