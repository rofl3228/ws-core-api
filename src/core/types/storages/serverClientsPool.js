const { ClientsPoolError } = require('../errors');

class ServerClientsPool {
  constructor(maxSize = 1024) {
    this._MAX_SIZE = maxSize;
    this._pool = new Map();
  }
  
  add(name, client) {
    if (this._pool.size === this._MAX_SIZE) {
      throw new ClientsPoolError('CLIENTS_LIMIT_REACHED');
    }

    this._pool.set(name, client);
  }

  get(name) {
    return this._pool.get(name);
  }

  get size() {
    return this._pool.size;
  }
}

module.exports = ServerClientsPool;
