const { ActionControllerError } = require('../errors');
const DataTransformer = require('../../utils/dataTransformer');

class ActionController {
  constructor(transport, callbackStorage) {
    this._transport = transport;
    this._callbacks = callbackStorage;
  }

  async execute() {
    throw new ActionControllerError('NOT_IMPLEMENTED');
  }

  async send() {
    let key;
    if (this.callback) {
      key = this._callbacks.add(this.callback);
    }

    let toSend = {
      type: 'action',
      name: this.constructor.name,
      data: await this.execute.apply(this, arguments),
      key,
    };

    this._transport.send(DataTransformer.encode(toSend));
  }
}

module.exports = ActionController;
