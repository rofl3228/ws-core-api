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
- Server
- Client
- ActionController
- EventController
- Errors
  - ActionControllerError
  - EventControllerError
- Utils
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

### ActionController

### EventController

## Examples  

## Release History
0.0.2 – bug fixes and documenation  

0.0.1 – Base architecture  

## License
Copyright (c) 2020 kirill.feofanov  
Licensed under the MIT license.
