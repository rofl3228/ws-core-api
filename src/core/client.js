const logger = require('./utils/logger')('ClientClass');
const WebSocket = require('ws');

class Client {
  constructor(url, options = {}) {
    this._url = url;
    this._options = options;
    this._authAction = async () => true;
  }

  async init() {
    this._ws = new WebSocket(this._url);
    logger.info(`Client started on URL: ${this._url}`);
    
    this._ws.on('open', this.#openHandler);
  }

  setAuthAction(fn) {
    this._authAction = fn;
  }

  #openHandler = async () => {
    logger.debug('Connection established');
    const isAuthorised = await this._authAction(this._ws);

    if (isAuthorised) {
      logger.debug('Client authorized');

      this._ws.on('message', this.#messageHandler);
      this._ws.on('error', this.#errorHandler);
      this._ws.on('close', this.#closeHandler);
    }
  }

  #messageHandler = async (message) => {
    const isAuthorised = await this._authAction();

    if (isAuthorised) {
      this._ws.on('message', this.#messageHandler);
      this._ws.on('error', this.#errorHandler);
      this._ws.on('close', this.#closeHandler);
    }
  }

  #errorHandler = (error) => {

  }

  #closeHandler = (code, error) => {

  }
}

module.exports = Client;
