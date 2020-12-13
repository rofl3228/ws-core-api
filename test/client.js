const Client = require('../src/core/client');
const DataTransformer = require('../src/core/utils/dataTransformer');
const { EventController, ActionController } = require('../lib/ws-core-api');
const logger = require('../src/core/utils/logger')('Client');

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
    logger.info(data);
  }
}

class Ping extends EventController {
  async execute() {
    logger.debug('called ping event')
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
