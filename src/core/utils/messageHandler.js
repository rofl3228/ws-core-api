const DataTransformer = require('./dataTransformer');
const logger = require('./logger')('MessageHandler');

class MessageHandler {
  constructor(ws, events, callbacks, errorHandlerFunction, ErrorClass) {
    this._ws = ws;
    this._events = events;
    this._callbacks = callbacks;
    this._errorHandlerFunction = errorHandlerFunction;
    this._ErrorClass = ErrorClass;
  }

  async handle(message) {
    let incomingData = {};

    try {
      incomingData = DataTransformer.decode(message);

      if (incomingData.type === 'action') {
        if (!this._events.has(incomingData.name)) {
          throw new this._ErrorClass(`UNKNOWN_EVENT: ${incomingData.name}`);
        }

        const EventClass = this._events.get(incomingData.name);
        const event = new EventClass(this._ws);
        await event.send(incomingData.key, incomingData.data);

      } else if (incomingData.type === 'event') {
        if (this._callbacks.has(incomingData.key)) {
          await this._callbacks.get(incomingData.key)(incomingData.data);
        }

      } else {
        throw new this._ErrorClass('UNKNOWN_MESSAGE_TYPE');
      }
    } catch (error) {
      const err = {
        data: { error: error.toString() },
        name: incomingData.name,
        key: incomingData.key,
        type: 'event',
      }
      this._ws.send(DataTransformer.encode(err));
      this._errorHandlerFunction(error);
    }
  }
}

module.exports = MessageHandler;
