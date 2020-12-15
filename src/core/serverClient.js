const MessageHandler = require('./utils/messageHandler');
const { CallbackStack } = require('./types/storages');
const { ServerClientError } = require('./types/errors');
const logger = require('./utils/logger')('ServerClient');

class ServerClient {
  constructor(ws, events, actions, messageErrorHandler) {
    this._ws = ws;
    this._actions = actions;
    this._callbacks = new CallbackStack()
    this._messageHandler = new MessageHandler(ws, events, this._callbacks, messageErrorHandler, ServerClientError);
    this._ws.on('message', this.#messageHandler);
    this._ws.on('error', this.#errorHandler);
    this._ws.on('close', this.#disconnectHandler);
  }

  #messageHandler = async (message) => {
    await this._messageHandler.handle(message);
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
