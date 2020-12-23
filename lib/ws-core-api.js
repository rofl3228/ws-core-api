/*
 * ws-core-api
 * https://github.com/rofl3228/ws-core-api
 *
 * Copyright (c) 2020 kirill.feofanov
 * Licensed under the MIT license.
 */

'use strict';

const Server = require('./core/server');
const Client = require('./core/client');
const { EventController, ActionController } = require('./core/types/controllers');
const { ActionControllerError, EventControllerError} = require('./core/types/errors');
const logger = require('./core/utils/logger');
const DataTransformer = require('./core/utils/dataTransformer');

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