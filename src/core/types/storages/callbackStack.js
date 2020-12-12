class CallbackStack {
  constructor(maxSize = 65536) {
    this._storage = new Map();
    this._maxSize = maxSize;
    this._key = 0;
  }

  add(fn) {
    if (this._key = this._maxSize) {
      this._key = 1;
    } else {
      this._key += 1;
    }

    this._storage.set(this._key, fn);

    return this._key;
  }

  get(key, save = false) {
    const callback = this._storage.get(key);

    if (!save) {
      this._storage.delete(key);
    }

    return callback;
  }

  has(key) {
    return this._storage.has(key);
  }
}

module.exports = CallbackStack;