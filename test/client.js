const coreAPI = require('../lib/ws-core-api');
const { Client, EventController, ActionController, Utils } = coreAPI;
const { DataTransformer, logger } = Utils;
const log = logger('Client');

const authFunction = async (ws) => {
  return new Promise((resolve, reject) => {
    ws.send(DataTransformer.encode({login: 'client', password: 'qwerty'}))
    ws.on('message', (message) => {
      const data = DataTransformer.decode(message);
      if (data.success) {
        resolve();
      } else {
        reject();
      }
    })
  }).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
};

class GetInfo extends ActionController {
  async execute() {
    return {};
  }

  async callback(data) {
    log.info(data);
  }
}

class Ping extends EventController {
  async execute() {
    log.debug('called ping event')
    return { response: 'pong' };
  }
}

(async () => {
  const client = new Client('ws://localhost:3000');
  client.setAuthAction(authFunction);
  client.addAction(GetInfo);
  client.addEvent(Ping);
  await client.init();

  setTimeout(async () => {
    await client.do('GetInfo');
  }, 800);
})();
