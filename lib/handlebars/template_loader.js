var fs = require("fs");
var handlebars = require("handlebars");

var utils = require("../utils");
var FileNotFoundError = require("../errors").FileNotFoundError;

module.exports = {
  fromPathSync: function(path) {
    if (!fs.existsSync(path)) {
      throw new FileNotFoundError(path);
    }
    var template = fs.readFileSync(path, {
      encoding: "utf-8"
    });
    return handlebars.compile(template);
  }
};
