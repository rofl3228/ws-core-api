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
- Errors
  - ActionControllerError
  - EventControllerError
- Utils
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
*Action* - класс, наследованный от ActionController

**return**  
`undefined`

#### *addEvent(* controller *)*
Добавляет обработчик входящего события от клиента для сервера  
`server.addEvent(Event)`  

**args**  
*Event* - класс, наследованный от EventController

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

### ActionController

### EventController

## Примеры  

## Release History
0.0.2 - исправление ошибок и написание документации  

0.0.1 - базовая архитектура  

## License
Copyright (c) 2020 kirill.feofanov  
Licensed under the MIT license.
