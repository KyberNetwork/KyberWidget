

import * as common from "../src/js/utils/common"

var network = common.getParameterByName("network")
var config_file

switch (network) {
  case "test":
    config_file = "ropsten.json"
    break
  case "mainnet":
    config_file = "production.json"
    break
  case "production":
    config_file = "production.json"
    break
  case "staging":
    config_file = "staging.json"
    break
  case "ropsten":
    config_file = "ropsten.json"
    break
  default:
    config_file = "ropsten.json"
    break
}

var config
try {
  config = require('./config-env/' + (config_file));
} catch (err) {
  if (err.code && err.code === 'MODULE_NOT_FOUND') {
    console.error('No config file matching ENV=' + env
      + '. Requires "' + env + '.json"');
    // process.exit(1);
  } else {
    throw err;
  }
}
module.exports = config;

