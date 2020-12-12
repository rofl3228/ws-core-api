const DataTransformer = require('./utils/dataTransformer');
const { ServerClientError } = require('./types/errors');
const logger = require('./utils/logger')('ServerClient');

class ServerClient {
  constructor(ws, events, actions, callbacks) {
    this._ws = ws;
    this._events = events;
    this._actions = actions;
    this._callbacks = callbacks;
    this._ws.on('message', this.#messageHandler);
    this._ws.on('error', this.#errorHandler);
    this._ws.on('close', this.#disconnectHandler);
  }
  
  #messageHandler = async (message) => {
    const incomingData = DataTransformer.decode(message);
    logger.debug('Incoming message: ', incomingData);

    if (incomingData.type === 'action') {
      if (!this._events.has(incomingData.name)) {
        throw new ServerClientError(`UNKNOWN_EVENT ${incomingData.name}`);
      }
      await this._events.get(incomingData.name).execute(incomingData.data);

    } else if (incomingData.type === 'event') {
      if (this._callbacks.has(incomingData.key)) {
        await this._callbacks.get(incomingData.key)(incomingData.data);
      }

    } else {
      throw new ServerClientError('UNKNOWN_MESSAGE_TYPE');
    }
  }

  #disconnectHandler = async () => {
    logger.debug('Client disconnected');
  }

  #errorHandler = async (error) => {
    throw new ServerClientError(error);
  }
}

module.exports = ServerClient;
