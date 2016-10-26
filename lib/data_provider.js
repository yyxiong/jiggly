var fs = require("fs");
var _ = require("lodash");

var config = require("./config");

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
// 初始化data
_.each(config.dataFiles, loadData);

module.exports = {

  loadData: loadData,

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
