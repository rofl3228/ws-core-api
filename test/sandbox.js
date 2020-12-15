const coreAPI = require('../lib/ws-core-api');
const { Server, Utils, ActionController, EventController, Errors } = coreAPI;
const { DataTransformer, logger }= Utils;
const log = logger('Server');


const authFunction = async (client) => {
  return new Promise((resolve, reject) => {
    client.on('message', (message) => {
      const data = DataTransformer.decode(message);

      if (data.login && data.password) {
        resolve();
      } else {
        reject();
      }
    })
  })
  .then(() => {
    client.send(DataTransformer.encode({ success: true, time: new Date().getTime() }));
    return true;
  })
  .catch(() => {
    client.send(DataTransformer.encode({ success: false }));
    return false;
  });
};

class GetInfoError extends Errors.EventControllerError {
  constructor(message) {
    super(message);
  }
}

class GetInfo extends EventController {
  async execute() {
    throw new GetInfoError('TEST');
    return {serverTime: new Date().getTime()};
  }
}

class Ping extends ActionController {
  async execute() {
    return {};
  }

  async callback(data) {
    log.debug(data.response);
  }
}

(async () => {
  const server = new Server(3000, {
    authTimeout: 15000,
  });
  server.setAuthHandler(authFunction);
  server.addEvent(GetInfo);
  server.addAction(Ping);
  await server.init();
  setTimeout(async () => {
    try {
      await server.getClient('client-0').do('Ping');
    } catch (e) {
      log.err(e);
    }
  }, 3000);
})();
