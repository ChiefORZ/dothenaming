#!/usr/bin/env node

const doTheNaming = require('../lib/index');

doTheNaming().then(() => process.exit(0), () => process.exit(1));
