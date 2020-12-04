const WebSocket = require('ws');

const logger = require('./utils/logger')('ServerClass');
const { ServerError } = require('./types/errors');
const DataTransformer = require('./utils/dataTransformer');
const { UnauthorizedStack } = require('./types/storages');
const { ActionController, EventController } = require('./types/controllers');

class Server {
  constructor(port, options = { authTimeout: 60000 }) {
    this._port = port;
    this._options = options;
    this._authHandler = async (client) => true;
    this._authStack = new UnauthorizedStack(options.authTimeout);
    this._actions = [];
  }

  /**
   * Start up server
   * @returns {Promise.<void>}
   */
  async init() {
    this._wss = new WebSocket.Server({ port: this._port, ...this._options });
    logger.info('SocketServer is listening on port: ', this._port);

    this._wss.on('connection', this.#connectionHandler);
    this._wss.on('error', (error) => {
      throw new ServerError(error.message);
    });
  }

  #connectionHandler = async (client) => {
    logger.debug('New client connected');
    this._authStack.add(client);

    const isAuthorised = await this._authHandler(client);

    this._authStack.delete(client);
    if (isAuthorised) {
      logger.debug('Client authorized');
      client.on('message', this.#messageHandler);
      client.on('close', this.#disconnectHandler);
    }
  }

  #messageHandler = async (message) => {
    const incomingData = DataTransformer.decode(message);
    logger.debug('Incoming message: ', incomingData);
  }

  #disconnectHandler = () => {
    logger.debug('Client disconnected');
  }

  /**
   * 
   * @param {Promise.<client>} fn 
   */
  setAuthHandler(fn) {
    this._authHandler = fn;
  }

  /**
   * 
   * @param {ActionController} action - accept ActionController inherit class instance
   */
  addAction(action) {
    if (!(action instanceof ActionController)) {
      throw new TypeError(`Action ${action.constructor.name} is not instance of ActionController-based class`);
    }

    this._actions.push(action);
  }

  addEvent(event) {
    if (!(event instanceof EventController)) {
      throw new TypeError(`Event ${event.constructor.name} is not instance of EventnController-based class`);
    }
  }
}

module.exports = Server;
