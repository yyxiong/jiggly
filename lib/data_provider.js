var fs = require("fs");
var path = require("path");
var _ = require("lodash");

var fileWatcher = require("./file_watcher");
var env = require("./enviroments");
var dataFilePaths = env.dataFiles;

var urlData = {};
var compData = {};
var globalData = {};

function loadData(dataFilePath) {
  if (fs.existsSync(dataFilePath)) {
    var data = require(dataFilePath);
    urlData = _.assign(urlData, data.urls);
    compData = _.assign(compData, data.comps);
    return globalData = _.assign(globalData, data.globals);
  }
};

_.each(dataFilePaths, loadData);

fileWatcher.watchFiles(dataFilePaths, function(dataFilePath) {
  require.cache[dataFilePath] = null;
  try {
    loadData(dataFilePath);
    console.log("[Data Reload] " + dataFilePath);
  } catch (error) {
    console.log("[Data Reload Error] " + dataFilePath + " - " + error);
  }
});

module.exports = {

  getUrlData: function(path, params, res) {
    if (!_.has(urlData, path)) {
      return {
        found: false
      };
    }
    var data = urlData[path];
    return {
      found: true,
      result: _.isFunction(data) ? data(params, res) : data
    };
  },

  getCompData: function(path, params) {
    if (!_.has(compData, path)) {
      return {
        found: false
      };
    }
    var data = compData[path];
    return {
      found: true,
      result: _.isFunction(data) ? data(params) : data
    };
  },

  getGlobalData: function() {
    return globalData;
  }
};
