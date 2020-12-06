const WebSocket = require('ws');

const logger = require('./utils/logger')('ServerClass');
const { ServerError } = require('./types/errors');
const ServerClient = require('./serverClient');
const DataTransformer = require('./utils/dataTransformer');
const { UnauthorizedStack, ServerClientsPool } = require('./types/storages');
const { ActionController, EventController } = require('./types/controllers');

class Server {
  constructor(port, options = { authTimeout: 60000, connectionsLimit: 1024 }) {
    this._port = port;
    this._options = options;
    this._authStack = new UnauthorizedStack(options.authTimeout);
    this._clients = new ServerClientsPool(options.connectionsLimit);
    this._authHandler = async (client) => true;
    this._nameGetter = async (client) => {
      return `client-${this._clients.size}`;
    };
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

    const isAuthorized = await this._authHandler(client);

    this._authStack.delete(client);
    if (isAuthorized) {
      this._clients.add(this._nameGetter(client), new ServerClient(client));
      logger.debug('Client authorized');
    }
  }


  /**
   * 
   * @param {Promise.<client>} fn 
   */
  setAuthHandler(fn) {
    this._authHandler = fn;
  }

  setClientNameGetter(fn) {
    this._nameGetter = fn
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

  getClient(name) {
    return this._clients.get(name);
  }
}

module.exports = Server;
