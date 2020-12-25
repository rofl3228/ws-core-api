[![lib-logo.png](https://i.postimg.cc/vTmCk2dS/lib-logo.png)](https://postimg.cc/r0vhtJsS)
# ws-core-api

api arch based on websocket [Ru](https://github.com/rofl3228/ws-core-api/blob/main/README_RU.md)
## General Concept

### Interaction principle  
Interaction between two nodes is organized by Event-Action principle. There exists a central node “Server” and its dependent nodes “Client”. Each node has its own actions and events – **action**  with a specific “Client” on the server “Server” calls an **event** on the client side. This is also true the other way around. Actions and events are matched by their equivalent class name.

### Actions and Events

***Action*** - can be called in a code and has a callback function. That is, when a node performs an action in relation to another node, then it can process the response to this action.

***Event*** - unlike an action, cannot be called from the outside and is executed only when “action” is performed on the node. Does not have a callback function.  

### For development

**!NB** Use base classes, provided in the library, to create your actions and events. Inherit error classes in the controllers to optimize their handling. 
## Getting started
Install module using: `npm install ws-core-api`

### Server and Client example
**server.js**
```javascript
const coreAPI = require('../lib/ws-core-api');
const { Server } = coreAPI;

(async () => {
    const server = new Server(3000);
    await server.init();
})();
```
**client.js**
```javascript
const coreAPI = require('../lib/ws-core-api');
const { Client } = coreAPI;

(async () => {
    const client = new Client('ws://localhost:3000');
    await client.init();
})();
```
This example demonstrates creating server and a client without adding actions and events
## Documentation  

Library structure:
- [Server](#server)
- [Client](#client)
- [ActionController](#actionController)
- [EventController](#eventController)
- [Errors](#errors)
  - ActionControllerError
  - EventControllerError
- [Utils](#utils)
  - DataTransformer
  - logger

### Server
The class that implements the operation of the "Server" node on the network.
#### Consturctor  
Accepts basic configuration parameters
```js
const server = new Server(port, {
    authTimeout,
    connectionsLimit,
})
```
**args**  
*port* – listening port for incoming connections
*authTimeout* – time, which client can spend without authorization after connection was established. By default – 60000ms (1 min)
*connectionsLimit* – max number of clients. By default - 1024

**return**  
`Server` instance

***Instance methods***  
#### *init()*  
Starts port listening
`server.init();`  

**return**  
`Promise<void>`

#### *addAction(* controller *)*
Adds action for the server
`server.addAction(Action)`  

**args**  
*Action* - class, inherited from ActionController

**return**  
`undefined`

#### *addEvent(* controller *)*
Adds an incoming client event handler for the server 
`server.addEvent(Event)`  

**args**  
*Event* - class, inherited from EventController

**return**  
`undefined`

#### *setAuthHandler(* fn *)*
Sets up client authorization handler. *fn* function will process all incoming data from the client until its authorization. Function *fn* requirements:
* Must be async
* Accept the *websocket* object of the incoming connection as an argument
* Boolean function ( returns *true/false* upon execution)

`server.setAuthHandler(fn);`  

**args**  
*fn* - async function  

**return**  
`undefined`

#### *setClientNameGetter(* fn *)*
Sets a function that assigns names to clients for their latter referral. *fn* function requirements:
* Must be async
* Accept the *websocket* object of the incoming connection as an argument
* Returns *string* upon its execution

`server.setClientNameGetter(fn);`  

**args**  
*fn* - async function  

**return**  
`undefined`

#### *setErrorHandler(* fn *)*
Sets an error handling function. Function has to take in error object as its argument `server.setErrorHandler(fn)`  

**args**  
*fn* - `function (error) {...}`

**return**  
`undefined`

#### *getClient(* name *)*
Returns a server client by its name. Functionality of the client will be described further
`server.getClient(name)`  

**args**  
*name* - string. assigned client name

**return**  
`ServerClient` instance

#### *ServerClient* instance
Connection class on the “Server” side. Calls “actions” on the server by incoming data from a client and has an only method – **do()**

***do(actionName, data)*** - Function, that performs an action on a client.

**args**  
*actionName* - string. Action class name  
*data* - object. An object that contains data for an “action”

**return**  
`Promise<void>`

### Client
The class that implements the operation of the "Client" node on the network.

#### Constructor
Accepts base configuration parameters

```js
const client = new Client(url, {
    reconnectTimeout,
    reconnectable,
})
```
**args**  
*url* - port, listening for incoming connections  
*reconnectTimeout* - time after connection disruption, after which client will try to reconnect. By default - 2000ms (2 s) 
*reconnectable* - boolean. Flag, that defines reconnect. By default *true*.  
**return**  
`Client` instance 
***Instance methods***  
#### *init()*  
Connection initialization to the server  
`server.init();`  

**return**  
`Promise<void>`  
#### *setAuthAction(* fn *)*
Sets up authorization function. This function handles all incoming data from the server. *fn* function requirements:
* Must be async
* Accept the *websocket* object of the incoming connection as an argument
* Boolean function ( returns *true/false* upon execution)

`client.setAuthAction(fn);`  

**args**  
*fn* - async function  

**return**  
`undefined`

#### *addAction(* controller *)*
Adds action to the server  
`server.addAction(Action)`  

**args**  
*Action* - class, inherited from [ActionController](#actionController)

**return**  
`undefined`

#### *addEvent(* controller *)*
Adds incoming event handler from client to server
`server.addEvent(Event)`  

**args**  
*Event* - class, inherited from [EventController](#eventController)

**return**  
`undefined`

#### *do(* actionName, data *)*
Calls client added action with its data
`client.do(actionName, data)`  

**args**  
*actionName* - string. Name of action class  
*data* - object(optional). Object that contains data for "action"  

**return**  
`Promise<void>`

### ActionController
Base class for actions, executed by the node. All actions must be inherited from this class.
Child classes must implement method *async execute(...params)* that defines action logic and returns data that will be transmitted.
Data, returned by the "event" on the other side of connection can be processe by the *async callback(data)* function.
Example:  
```js
class Ping extends ActionController {
    async execute(serverTime) {
        return { serverTime }
    }
    
    async callback(data) {
        console.log(`Client time: ${data.time});
    }
}
```
Upon execution of an **action**, it is expected that you have a corresponding **event** on the receiving side of connection. If such event does not exist, unknown event error will be thrown. 
### EventController
Event class that processes data from action. All event classes must be inherited from **EventController**.
Child classes must define *async execute(data)* method that proceeses incoming data. 
Example:
```js
class Ping extends EventController {
    async execute(data) {
        console.log(`Server time: ${data.serverTime}`);
        return { time: new Date().getTime() };
    }
}
```
Data, returned by `execute`, will be sent to callback function
### Errors
Library object that contains 2 base error classes: ActionControllerError and EventControllerError. Create your own error classes for your actions and events - it will simplify debugging.
### Utils
Object that contains library utilities. 

**DataTransformer** - class that encodes/decodes transmitting information. Has two methods *encode(json)* and *decode(string)* 

**logger** - built-in logging mechanism with the use of *chulk* library for output formatting. Function, that accepts argument - `AREA` scope and returns an object with 4 functions:  `debug(), info(), warn(), err()`. Logger outputs information into console in the following format:

`[hh:mm:ss:ms] WARN module: <SCOPE> <PASSED_DATA>`  

`module: <SCOPE>` will be skipped if upon logger intialization loggger scope was not sent. Logger has an increased depth of js-objects insepction.
## Examples  

Example of "Server" node.
```js
// server.js
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

class GetInfo extends EventController {
  async execute() {
    return { time: new Date().getTime() };
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

  // example of action executing
  setTimeout(async () => {
    try {
      await server.getClient('client-0').do('Ping');
    } catch (e) {
      log.err(e);
    }
  }, 3000);
})();
```

Example "Client" node.
```js
// client.js
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
```

## Release History
0.0.2 – bug fixes and documenation  

0.0.1 – Base architecture  

## License
Copyright (c) 2020 kirill.feofanov  
Licensed under the MIT license.
