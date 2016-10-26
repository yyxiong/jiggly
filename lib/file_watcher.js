var watch = require("node-watch");
var _ = require("lodash");

module.exports = {
  watchFiles: function(filePaths, callback, options) {
    if (!options) {
      options = {};
    }
    if (_.isArray(filePaths)) {
      return _.each(filePaths, function(filePath) {
        return watch(filePath, options, callback);
      });
    } else {
      return watch(filePaths, options, callback);
    }
  }
};
