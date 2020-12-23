const chalk = require('chalk');
const moment = require('moment');
const { inspect } = require('util');

/**
 * Cast incoming data to readble format
 * @returns {Array}
 */
const normalizeData = function(data) {
  const args = [];

  for (let arg of data) {
    if (typeof arg === 'string' || arg instanceof String) {
      args.push(arg);
    } else {
      args.push(inspect(arg, { showHidden: false, depth: 10, colors: true, compact: false }));
    }
  }

  return args;
}

const log = function (module = '') {
  return {
    err: function () {
      console.log(
        `[${moment().format('HH:mm:ss:ms')}]`,
        chalk.red('ERROR'),
        module !== '' ? ('MODULE:' + chalk.greenBright(module)) : '', 
        ...normalizeData(arguments)
      );
    },
    warn: function () {
      console.log(
        `[${moment().format('HH:mm:ss:ms')}]`,
        chalk.yellow('WARN'),
        module !== '' ? ('MODULE:' + chalk.greenBright(module)) : '',
        ...normalizeData(arguments)
      );
    },
    debug: function () {
      console.log(
        `[${moment().format('HH:mm:ss:ms')}]`,
        chalk.blue('DBG'),
        module !== '' ? ('MODULE:' + chalk.greenBright(module)) : '',
        ...normalizeData(arguments)
      );
    },
    info: function () {
      console.log(
        `[${moment().format('HH:mm:ss:ms')}]`,
        chalk.cyan('INFO'),
        module !== '' ? ('MODULE:' + chalk.greenBright(module)) : '',
        ...normalizeData(arguments)
      );
    }
  }
};

module.exports = log;