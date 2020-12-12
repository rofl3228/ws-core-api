const coreAPI = require('../lib/ws-core-api');
const { Server, Utils, ActionController, EventController } = coreAPI;
const DataTransformer = Utils.DataTransformer;

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

class GetInfo extends EventController {
  async execute() {
    return {serverTime: new Date().getTime()};
  }
}

(async () => {
  const server = new Server(3000, {
    authTimeout: 15000,
  });
  server.setAuthHandler(authFunction);
  server.addEvent(GetInfo)
  await server.init();
})();
