var fs = require("fs");
var handlebars = require("handlebars");

var utils = require("../utils");
var FileNotFoundError = require("../errors").FileNotFoundError;
var blankTemplate = handlebars.compile("");

module.exports = {
  fromPathSync: function(path) {
    var template;
    if (!fs.existsSync(path)) {
      throw new FileNotFoundError(path);
    }
    template = fs.readFileSync(path, {
      encoding: "utf-8"
    });
    return handlebars.compile(template);
  },
  fromText: function(text) {
    return handlebars.compile(text);
  }
};
