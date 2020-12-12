const { EventControllerError } = require('../errors');
const DataTransformer = require('../../utils/dataTransformer');

class EventController {
  constructor(transport) {
    this._transport = transport;
  }

  async execute() {
    throw new EventControllerError('NOT_IMPLEMENTED');
  }

  async send() {
    const data = {
      
    }
  }
}

module.exports = EventController;
