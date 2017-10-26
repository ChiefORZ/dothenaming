const config = require('./config');
const log = require('./log');
const pkg = require('../../package.json');

const helpText = `${pkg.name} v${pkg.version}
  
  Usage: ${pkg.name} <source> <destination> [options]
  
  -h --help              Print this help
  -v --version           Print version number
  -V --verbose           Verbose output`;

const version = () => log.log(`v${pkg.version}`);
const help = () => log.log(helpText);

module.exports = {
  config,
  help,
  log,
  version,
};
