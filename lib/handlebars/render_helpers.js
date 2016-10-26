var handlebars = require("handlebars");
var _ = require("lodash");

var render = require("./render");
var dataProvider = require("../data_provider");
var config = require("../config");

var blocks = {};  // 保存所有的block，partial

handlebars.registerHelper("inject", function(path, options) {
  var tempContext = _.clone(this);
  _.assign(tempContext, options.hash);
  if (options.fn) {
    var compData = JSON.parse(options.fn());
    _.assign(tempContext, compData);
  }
  var dataResult = dataProvider.getCompData(path, tempContext);
  if (dataResult.found) {
    var mockResult = dataResult.result;
    var mockContext = {
      _DATA_: _.omit(mockResult, '_SERVICES_')
    };
    if (_.isObject(mockResult._SERVICES_)) {
      _.assign(mockContext, mockResult._SERVICES_);
    }
    _.assign(tempContext, mockContext);
  }
  return new handlebars.SafeString(render.renderComponent(path, tempContext));
});

handlebars.registerHelper("component", function(className, options) {
  return new handlebars.SafeString("<div class=\"" + className + "\" data-comp-path=\"" + this[render.CONST.COMP_PATH] + "\">" + (options.fn(this)) + "</div>");
});

handlebars.registerHelper("designPart", function() {
  var options = _.last(arguments);
  if (options.fn) {
    return options.fn(this);
  }
});

handlebars.registerHelper("partial", function(name, options) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }
  block.push(options.fn(this));
  return;
});

handlebars.registerHelper("block", function(name, options) {
  var block = blocks[name] || [];
  if (block.length === 0) {
    if (options.fn) {
      return options.fn(this);
    }
    return "";
  }
  blocks[name] = [];
  return block.join("\n");
});

config.extraHelpers.forEach(function(helperPath) {
  try {
    require(helperPath)(handlebars);
  } catch (error) {
    console.error("error when load extra helper file: " + helperPath, error);
  }
});
