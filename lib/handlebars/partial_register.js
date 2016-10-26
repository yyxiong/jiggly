var _ = require('lodash');
var fs = require("fs");
var handlebars = require("handlebars");
var glob = require("glob");

var config = require("../config");

function registerTemplateComp(filePath) {
  if (!/\.hbs$/.test(filePath)) {
    return;
  }
  var hbs = fs.readFileSync(filePath);
  var name = filePath.slice(config.componentsHome.length + 1).split(".")[0];
  name = "component:" + name;
  return handlebars.registerPartial(name, handlebars.compile(hbs.toString()));
};

/**
 * 初始化template component
 */
(function initTemplateComponent() {
  var filePaths = glob.sync(config.componentsHome + '/**/{all_templates,other_templates,templates}/*.hbs');
  return _.map(filePaths, registerTemplateComp);
})();


function registerLayout(filePath) {
  if (!/\.hbs$/.test(filePath)) {
    return;
  }
  var hbs = fs.readFileSync(filePath);
  var name = filePath.slice(config.viewsHome.length + 1).split(".")[0];
  if (config.oldMode) {
    name = "views/" + name;
  }
  return handlebars.registerPartial(name, handlebars.compile(hbs.toString()));
};

(function initLayouts(dir) {
  if (!fs.existsSync(dir)) {
    console.error('viewsHome is not exist', dir);
    return;
  }
  var files = fs.readdirSync(dir);
  files.forEach(function(file) {
    var filePath = dir + "/" + file;
    if (fs.statSync(filePath).isDirectory()) {
      return initLayouts(filePath);
    }
    registerLayout(filePath);
  });
})(config.viewsHome);

module.exports = {

  registerTemplateComp: registerTemplateComp,

  registerLayout: registerLayout
};

