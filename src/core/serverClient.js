const { ServerClientError } = require('./types/errors');
const logger = require('./utils/logger')('ServerClient');

class ServerClient {
  constructor(ws) {
    this._ws = ws;
    this._ws.on('message', this.#messageHandler);
    this._ws.on('error', this.#errorHandler);
    this._ws.on('close', this.#disconnectHandler);
  }
  
  #messageHandler = async (message) => {
    const incomingData = DataTransformer.decode(message);
    logger.debug('Incoming message: ', incomingData);
  }

  #disconnectHandler = async () => {
    logger.debug('Client disconnected');
  }

  #errorHandler = async (error) => {
    throw new ServerClientError(error);
  }
}

module.exports = ServerClient;
