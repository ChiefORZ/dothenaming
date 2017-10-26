const createDebug = require('debug');
const pkg = require('../package.json');

module.exports = arg => {
  createDebug(`${pkg.name}:${arg}`);
};
