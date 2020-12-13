const DataTransformer = require('./utils/dataTransformer');
const { CallbackStack } = require('./types/storages');
const { ServerClientError } = require('./types/errors');
const logger = require('./utils/logger')('ServerClient');

class ServerClient {
  constructor(ws, events, actions) {
    this._ws = ws;
    this._events = events;
    this._actions = actions;
    this._callbacks = new CallbackStack();
    this._ws.on('message', this.#messageHandler);
    this._ws.on('error', this.#errorHandler);
    this._ws.on('close', this.#disconnectHandler);
  }
  
  #messageHandler = async (message) => {
    const incomingData = DataTransformer.decode(message);

    if (incomingData.type === 'action') {
      if (!this._events.has(incomingData.name)) {
        throw new ServerClientError(`UNKNOWN_EVENT ${incomingData.name}`);
      }

      const EventClass = this._events.get(incomingData.name);
      const event = new EventClass(this._ws);
      await event.send(incomingData.key, incomingData.data);

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

  do(actionName, data = null) {
    const ActionClass = this._actions.get(actionName);
    const action = new ActionClass(this._ws, this._callbacks);
    return action.send(data);
  }
}

module.exports = ServerClient;
