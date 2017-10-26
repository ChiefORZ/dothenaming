/* eslint-disable no-console */
const chalk = require('chalk');

const log = console.log;
const info = (...args) => log(chalk.grey(...args));
const warn = (...args) => log(chalk.yellow('WARNING'), ...args);
const error = (...args) => log(chalk.red('ERROR'), ...args);

module.exports = {
  log,
  info,
  warn,
  error,
};
