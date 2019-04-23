var config = {
  ropsten: require('./config-env/ropsten.json'),
  production: require('./config-env/production.json'),
  mainnet: require('./config-env/production.json'),
  rinkeby: require('./config-env/rinkeby.json'),
  staging: require('./config-env/staging.json')
};

module.exports = config;

