const parseArgs = require('yargs-parser');
const path = require('path');

const aliases = {
  d: 'destination',
  h: 'help',
  s: 'source',
  v: 'version',
  V: 'verbose',
};

class Config {
  constructor(args) {
    this.parseCliArguments(args || {});
  }

  parseCliArguments(args) {
    const cli = parseArgs(args, {
      boolean: true,
      alias: aliases,
    });
    cli.source = cli._[0] || cli.s || `${process.cwd()}${path.sep}_unsorted`;
    cli.destination = cli._[1] || cli.d || process.cwd();
    cli.copyNFO = true;
    cli.removeParentDir = true;
    this.options = cli;
  }

  get isShowVersion() {
    return !!this.options.version;
  }

  get isShowHelp() {
    return !!this.options.help;
  }

  get isVerbose() {
    return this.options.verbose;
  }
}

module.exports = new Config([].slice.call(process.argv, 2));
