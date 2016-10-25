var watch = require("node-watch");
var _ = require("lodash");

module.exports = {
  watchFiles: function(filePaths, callback) {
    if (_.isArray(filePaths)) {
      return _.each(filePaths, function(filePath) {
        return watch(filePath, callback);
      });
    } else {
      return watch(filePaths, callback);
    }
  }
};
