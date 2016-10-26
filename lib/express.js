var expressStatic = require('serve-static');

var config = require('./config');

module.exports = function(app) {
  if (config.assetsPrefix) {
    app.use(config.assetsPrefix, expressStatic(config.filesHome));
  } else {
    app.use(expressStatic(config.filesHome));
  }
};

