const chalk = require('chalk');
const moment = require('moment');

/**
 * Cast incoming data to readble format
 * @returns {Array}
 */
const normalizeData = function(data) {
  const args = [];

  for (let arg of data) {
    if (arg instanceof Error) {
      args.push(arg)
    } else if (arg instanceof Object) {
      args.push('\n', JSON.stringify(arg, null, 2))
    } else {
      args.push(arg)
    }
    
  }

  return args;
}

const log = function (module = '') {
  return {
    err: function () {
      console.log(
        `[${moment().format('hh:mm:ss:ms')}] `,
        chalk.red('ERROR '),
        module !== '' ? ('MODULE: ' + chalk.greenBright(module)) : '', 
        ...normalizeData(arguments)
      );
    },
    warn: function ([...args]) {
      console.log(
        `[${moment().format('hh:mm:ss:ms')}] `,
        chalk.yellow('WARN '),
        module !== '' ? ('MODULE: ' + chalk.greenBright(module)) : '',
        ...normalizeData(arguments)
      );
    },
    debug: function ([...args]) {
      console.log(
        `[${moment().format('hh:mm:ss:ms')}] `,
        chalk.blue('DBG '),
        module !== '' ? ('MODULE: ' + chalk.greenBright(module)) : '',
        ...normalizeData(arguments)
      );
    },
    info: function ([...args]) {
      console.log(
        `[${moment().format('hh:mm:ss:ms')}] `,
        chalk.cyan('INFO '),
        module !== '' ? ('MODULE: ' + chalk.greenBright(module)) : '',
        ...normalizeData(arguments)
      );
    }
  }
};

module.exports = log;