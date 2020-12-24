[![lib-logo.png](https://i.postimg.cc/vTmCk2dS/lib-logo.png)](https://postimg.cc/r0vhtJsS)
# ws-core-api

api arch based on websocket

## Getting Started
Install the module with: `npm install ws-core-api`

Use on your server side
```javascript
const coreAPI = require('../lib/ws-core-api');
const { Server, Utils, ActionController, EventController, Errors } = coreAPI;
const { DataTransformer, logger }= Utils;
const log = logger('Server');

// Setup custom authenticate function
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

// Extend yuor EventController errors for easely handling
class GetInfoError extends Errors.EventControllerError {
  constructor(message) {
    super(message);
  }
}

// Inherit your controllers by base-class
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

// Run your server side
(async () => {
  const server = new Server(3000, {
    authTimeout: 15000,
  });
  server.setAuthHandler(authFunction);
  server.addEvent(GetInfo);
  server.addAction(Ping);
  await server.init();

  // example of action executing
  setTimeout(async () => {
    try {
      await server.getClient('client-0').do('Ping');
    } catch (e) {
      log.err(e);
    }
  }, 3000);
})();

// It is easy!

```

Use on your clien side
```javascript
const coreAPI = require('../lib/ws-core-api');
const { Client, EventController, ActionController, Utils } = coreAPI;
const { DataTransformer, logger } = Utils;
const log = logger('Client');

// Set authentication function. It'll be called immideatly after connection establishing
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

// Prepare controllers
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

// Run your client!
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

```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2020 kirill.feofanov  
Licensed under the MIT license.
