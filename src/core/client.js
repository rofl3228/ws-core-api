const logger = require('./utils/logger')('ClientClass');
const WebSocket = require('ws');
const { CallbackStack } = require('./types/storages');
const { ClientError } = require('./types/errors');
const { ActionController, EventController } = require('./types/controllers');
const DataTransformer = require('./utils/dataTransformer');

class Client {
  constructor(url, options = {reconnectTimeout: 2000, reconnectable: true}) {
    this._url = url;
    this._reconnectable = options.reconnectable;
    this._reconnectTimeout = options.reconnectTimeout;
    this._authAction = async () => true;
    this._callbacks = new CallbackStack();
    
    this._actions = new Map();
    this._events = new Map();
  }

  async init() {
    this._ws = new WebSocket(this._url);
    logger.info(`Client started on URL: ${this._url}`);
    
    this._ws.on('open', this.#openHandler);
    this._ws.on('error', this.#errorHandler);
  }

  setAuthAction(fn) {
    this._authAction = fn;
  }

  #openHandler = async () => {
    try {
      logger.debug('Connection established');
      const isAuthorised = await this._authAction(this._ws);
  
      if (isAuthorised) {
        logger.debug('Client authorized');
  
        this._ws.on('message', this.#messageHandler);
        this._ws.on('close', this.#closeHandler);
      } else {
        throw new ClientError('UNAUTHORIZED');
      }
    } catch (error) {
      logger.err(error);
    }
  }

  #messageHandler = async (message) => {
    const incomingData = DataTransformer.decode(message);

    if (incomingData.type === 'action') {
      if (!this._events.has(incomingData.name)) {
        throw new ClientError(`UNKNOWN_EVENT ${incomingData.name}`);
      }
      await this._events.get(incomingData.name).execute(incomingData.data);

    } else if (incomingData.type === 'event') {
      if (this._callbacks.has(incomingData.key)) {
        await this._callbacks.get(incomingData.key)(incomingData.data);
      }

    } else {
      throw new ClientError('UNKNOWN_MESSAGE_TYPE');
    }
  }

  #errorHandler = (error) => {
    if (error.code === 'ECONNREFUSED') {
      logger.warn('CONNECTION_LOST');
      this.#reconnect();
    } else {
      logger.err(error);
      throw new ClientError(error);
    }
  }

  #closeHandler = (code) => {
    logger.debug('CONNECTION_CLOSED',code);
    this.#reconnect();
  }

  #reconnect = async () => {
    if (this._reconnectable) {
      setTimeout(async () => await this.init(), this._reconnectTimeout);
    } else {
      throw new ClientError('SERVER_CLOSED');
    }
  }

  addEvent(EventClass) {
    if (!(EventClass.prototype instanceof EventController)) {
      throw new TypeError(`Event ${EventClass.name} is not instance of EventnController-based class`);
    }
    
    this._events.set(EventClass.name, EventClass);
  }

  addAction(ActionClass) {
    if (!(ActionClass.prototype instanceof ActionController)) {
      throw new TypeError(`Action ${ActionClass.name} is not instance of ActionController-based class`);
    }

    this._actions.set(ActionClass.name, ActionClass);
  }

  do(actionName, data = null) {
    const ActionClass = this._actions.get(actionName);
    const action = new ActionClass(this._ws, this._callbacks);
    return action.send(data);
  }
}

module.exports = Client;
