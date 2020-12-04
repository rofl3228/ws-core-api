class UnauthorizedStack {
  constructor(timeout = 60000) {
    this._store = new Map();
    this._key = 0
    this._timeout = timeout;
  }

  add(client) {
    this._key += 1;
    this._store.set(this._key, client);

    const timerId = setTimeout(() => {
      client.close(1001, "AUTH_TIMEOUT");
    }, this._timeout);
    client._meta = {
      authTimerId: timerId,
      clientId: this._key,
    };
  }

  delete(client) {
    clearTimeout(client._meta.authTimerId);
    this._store.delete(client._meta.clientId);
    delete client._meta;
  }
}

module.exports = UnauthorizedStack;
