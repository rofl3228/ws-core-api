/*
 * ws-core-api
 * https://github.com/rofl3228/ws-core-api
 *
 * Copyright (c) 2020 kirill.feofanov
 * Licensed under the MIT license.
 */

'use strict';

const Server = require('../src/core/server');
const Client = require('../src/core/client');
const { EventController, ActionController } = require('../src/core/types/controllers');
const { ActionControllerError, EventControllerError} = require('../src/core/types/errors');
const logger = require('../src/core/utils/logger');
const DataTransformer = require('../src/core/utils/dataTransformer');

exports.Server = Server;
exports.Client = Client;
exports.EventController = EventController;
exports.ActionController = ActionController;
exports.Errors = {
  ActionControllerError,
  EventControllerError,
};
exports.Utils = {
  logger,
  DataTransformer,
}