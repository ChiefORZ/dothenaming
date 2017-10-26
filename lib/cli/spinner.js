const config = require('./config');
const ora = require('ora');
const { log } = require('./log');

const noop = Promise.resolve();

const showSpinner = !config.isVerbose;
const spinner = showSpinner
  ? ora()
  : {
      init: () => spinner,
      start: t => {
        log(t);
        return spinner;
      },
      succeed: () => spinner,
      warn: () => spinner,
      fail: () => spinner,
    };

function getSpinner() {
  return spinner;
}

function run(shouldRun, task, txt) {
  if (!shouldRun) return noop;
  const p = task();
  if (showSpinner) {
    ora.promise(p, txt);
  }
  return p;
}

module.exports = {
  getSpinner,
  run,
};
