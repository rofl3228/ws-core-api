const Server = require('../src/core/server');
const DataTransformer = require('../src/core/utils/dataTransformer');

const { ActionController, EventController } = require('../src/core/types/controllers');

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

class BotsAction extends ActionController {
  constructor(name){
    super(name);
  }
}

const server = new Server(3000, {
  authTimeout: 15000,
});
server.setAuthHandler(authFunction);
server.addAction(new BotsAction());
server.init();