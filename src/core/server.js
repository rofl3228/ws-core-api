const WebSocket = require('ws');

const logger = require('./utils/logger');

class Server {
  constructor(port, options = {}) {
    this.#wss = new WebSocket.Server({ port, ...options});
    
  }
}