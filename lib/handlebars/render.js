var fs = require("fs");
var path = require('path');

var config = require("../config");
var templateLoader = require("./template_loader");

var FileNotFoundError = require("../errors").FileNotFoundError;

require("./helpers");

function getRealPath(viewPath) {
  return path.join(config.viewsHome, viewPath) + (config.pageMode ? "/view.hbs" : ".hbs");
};

function getComponentViewPath(compPath) {
  return path.join(config.componentsHome, compPath, "view.hbs");
};

function renderFromRealPath(realPath, context) {
  var template = templateLoader.fromPathSync(realPath);
  return template(context);
};

module.exports = {

  renderFile: function(viewPath, context) {
    return renderFromRealPath(getRealPath(viewPath), context);
  },

  renderComponent: function(compPath, context) {
    context = context || {};
    context[this.CONST.COMP_PATH] = compPath;
    try {
      return renderFromRealPath(getComponentViewPath(compPath), context);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        console.log("[Component Not Found] " + error.path);
        return "component view not found: " + error.path;
      } else {
        throw error;
      }
    }
  },

  CONST: {
    COMP_PATH: "COMP_PATH"
  }
};

require("./render_helpers");
require('./partial_register');
