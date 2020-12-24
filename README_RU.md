[![lib-logo.png](https://i.postimg.cc/vTmCk2dS/lib-logo.png)](https://postimg.cc/r0vhtJsS)
# ws-core-api

## Общая концепция

### Принцип взаимодействия  
Взаимодействие между двумя узлами организовано по принципу Event-Action взаимодействия. То есть в системе имеется Центральный узел "Server" и зависимые узлы "Client". Каждый тип узла имеет события и действия - **действие** с поределенным "Client" на сервере ("Server") вызывает **событие** на стороне клиента. Это справедливо и в обратную сторону. Действия и события сопоставляются по эквивалентному имени класса.

### Действия и событии

***Действие*** - может быть вызвано в коде и имеет функцию обратного вызова. То есть когда узел совершает действие в отношение другого узла, то он может обработать ответ на это действие.  

***Событие*** - в отличии от действия не может быть вызвано извне, и выполняется только при совершении над узлом "действия". У события нет функции обратного вызова.  

### Для разработки

**!NB** Используйте базовые классы, предоставленные в библиотеке, для создания своих действий и событий. Наследуйте классы ошибок в контроллерах для оптимизации их обработки.

## Getting started
Установите модуль при помощи: `npm install ws-core-api`

### Короткий пример сервера и клиента
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
Данный пример демонстрирует создание сервера и клиента без добавления действий и событий.

## Документация  

Структура библиотеки:
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
Класс, реализующий работу узла "Server" в сети.  

#### Конструктор  
Принимает основные конфигурационные параметры.
```js
const server = new Server(port, {
    authTimeout,
    connectionsLimit,
})
```
**args**  
*port* - порт, на котором ожидаются входящие соединения.  
*authTimeout* - время, которое клиент может провести в неавторизованном состоянии после подключения. По умолчанию 60000 ms (1 min).  
*connectionsLimit* - максимальное количество клиентов. По умолчанию 1024.  
**return**  
`Server` instance

***Методы экземпляра***  
#### *init()*  
Запуск прослушивания на порту  
`server.init();`  

**return**  
`Promise<void>`

#### *addAction(* controller *)*
Добавляет действие для сервера  
`server.addAction(Action)`  

**args**  
*Action* - класс, наследованный от [ActionController](#actionController)

**return**  
`undefined`

#### *addEvent(* controller *)*
Добавляет обработчик входящего события от клиента для сервера  
`server.addEvent(Event)`  

**args**  
*Event* - класс, наследованный от [EventController](#eventController)

**return**  
`undefined`

#### *setAuthHandler(* fn *)*
Устанавливает обработчик авторизации клиента. Функция *fn* будет обрабатывать все входящие данные от клиента до момента его авторизации. Требования к функции *fn*:
* Должна быть асинхронной
* В качестве аргумента принимать объект *websocket* входящего соединения
* Возвращать по итогу своего выполнения *true/false*  

`server.setAuthHandler(fn);`  

**args**  
*fn* - async function  

**return**  
`undefined`

#### *setClientNameGetter(* fn *)*
Устанавливает функцию, присваивающую имена клиентам для последующего обращения к ним. Требования к функции *fn*:
* Должна быть асинхронной
* В качестве аргумента принимать объект *websocket* входящего соединения
* Возвращать по итогу своего выполнения строку  

`server.setClientNameGetter(fn);`  

**args**  
*fn* - async function  

**return**  
`undefined`

#### *setErrorHandler(* fn *)*
Устанавливает функцию-обработчик ошибок. Функция должна принимать в качестве аргумента объект ошибки.   
`server.setErrorHandler(fn)`  

**args**  
*fn* - `function (error) {...}`

**return**  
`undefined`

#### *getClient(* name *)*
Возвращает клиента сервера по его имени. Функционал серверного клиента будет описан ниже.  
`server.getClient(name)`  

**args**  
*name* - string. присвоенное клиенту имя

**return**  
`ServerClient` instance

#### *ServerClient* instance
Класс соединения на стороне "Server". Вызывает "действия" на сервере по входящим данным от клиента и имеет единственный метод - **do()**  

***do(actionName, data)*** - функция, выполняющая действие над клиентом.  

**args**  
*actionName* - string. Имя класса действия  
*data* - object. Объект, содержащий данные для "действия"  

**return**  
`Promise<void>`

### Client
Класс, реализующий работу узла "Client" в сети.

#### Конструктор
Принимает основные конфигурационные параметры.
```js
const client = new Client(url, {
    reconnectTimeout,
    reconnectable,
})
```
**args**  
*url* - порт, на котором ожидаются входящие соединения.  
*reconnectTimeout* - время после разрыва соединения, после которог клиент попробует переподключиться. По умолчанию 2000 ms (2 s).  
*reconnectable* - boolean. Флаг, определяющий переподключение. По умолчанию *true*.  
**return**  
`Client` instance  

***Методы экземпляра***  
#### *init()*  
Инициализация подключения к серверу  
`server.init();`  

**return**  
`Promise<void>`  

#### *setAuthAction(* fn *)*
Устанавливает функцию авторизации. Эта функция будет обрабатывать все входящие данные от сервера до её завершения. Требования к функции *fn*:
* Должна быть асинхронной
* В качестве аргумента принимать объект *websocket* входящего соединения
* Возвращать по итогу своего выполнения *true/false*  

`client.setAuthAction(fn);`  

**args**  
*fn* - async function  

**return**  
`undefined`

#### *addAction(* controller *)*
Добавляет действие для сервера  
`server.addAction(Action)`  

**args**  
*Action* - класс, наследованный от [ActionController](#actionController)

**return**  
`undefined`

#### *addEvent(* controller *)*
Добавляет обработчик входящего события от клиента для сервера  
`server.addEvent(Event)`  

**args**  
*Event* - класс, наследованный от [EventController](#eventController)

**return**  
`undefined`

#### *do(* actionName, data *)*
Вызывает выполнение действия, кобавленного клиенту, с переданными данным
`client.do(actionName, data)`  

**args**  
*actionName* - string. Имя класса действия  
*data* - object(optional). Объект, содержащий данные для "действия"  

**return**  
`Promise<void>`

### ActionController
Базовый класс для действий, выполняемых узлом. Все действия должны быть наследованны от этого класса.
Наследники класса обязаны реализовывать метод *async execute(...params)* исполняющий основную логику действия и возвращающий данные, которые будут переданы.
Также если событие на другой стороне соединения возвращает данные, то они могут быть обработаны функцией *async callback(data)*. Пример:  
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
При вызове действия ожидается, что у принимающей стороны имеется соответствующее событие. Если такого события нет, то будет выброшена ошибка о неизвестном ивенте. 

### EventController
Базовый клас событий для обработки данных от действия. Все классы событий должны быть наследованны от этого класса.  
Наследники класса обязаны реализовывать метод *async execute(data)* выполняющий обработку входных данных. Пример:
```js
class Ping extends EventController {
    async execute(data) {
        console.log(`Server time: ${data.serverTime}`);
        return { time: new Date().getTime() };
    }
}
```
Данные, возвращенные `execute`, будут переданы в callback-функцию действия.

### Errors
Объект библиотеки, содержащий два базовых класса ошибок: ActionControllerError и EventControllerError. Создавайте свои классы ошибок для своих действий и событий - это упрощает анализ возникающих проблем :)

### Utils
Объект содержащий утилиты библиотеки.  

**DataTransformer** - класс для кодирования/декодирования передоваемой информации. Имеет два метода *encode(json)* и *decode(string)*  

**logger** - встроеный механизм логирования с использованием *chulk* для форматирования вывода. Представлен функцией, которая может принимать аргумент - область логирования `AREA`, и возвращает объект с 4 функциями: `debug(), info(), warn(), err()`. Логер выводит тнформацию в консоль в следующем виде:  
`[hh:mm:ss:ms] WARN module: <AREA> <PASSED_DATA>`  
Если при инициализации логера  не было передано имя области логирования, то `module: <AREA>` будет пропущено. Также у логера увеличена глубина инспекции js-объектов.

## Примеры  
Пример "Server" узла.
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

Пример "Client" узла.
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
0.0.2 - исправление ошибок и написание документации  

0.0.1 - базовая архитектура  

## License
Copyright (c) 2020 kirill.feofanov  
Licensed under the MIT license.
