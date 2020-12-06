const Client = require('../src/core/client');
const DataTransformer = require('../src/core/utils/dataTransformer');

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

const client = new Client('ws://localhost:3000');
client.setAuthAction(authFunction);
client.init();

console.log(typeof Proxy);