const { EventControllerError } = require('../errors');
const DataTransformer = require('../../utils/dataTransformer');

class EventController {
  constructor(transport) {
    this._transport = transport;
  }

  async execute() {
    throw new EventControllerError('NOT_IMPLEMENTED');
  }

  async send(key, data) {
    const toSend = {
      type: 'event',
      name: this.constructor.name,
      data: await this.execute(data),
      key,
    };

    this._transport.send(DataTransformer.encode(toSend));
  }
}

module.exports = EventController;
