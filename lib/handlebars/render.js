var _ = require("lodash");
var fs = require("fs");
var glob = require("glob");
var handlebars = require("handlebars");

var fileWatcher = require("../file_watcher");
var env = require("../enviroments");
var templateLoader = require("./template_loader");

var FileNotFoundError = require("../errors").FileNotFoundError;

require("./helpers");

env.extraHelpers.forEach(function(helperPath) {
  try {
    return require(helperPath)(handlebars);
  } catch (error) {
    return console.error("error when load extra helper file: " + helperPath, error);
  }
});

var componentsPartials = [];
function registerComponentLayout(filePath) {
  if (!/\.hbs$/.test(filePath)) {
    return;
  }
  var hbs = fs.readFileSync(filePath);
  var name = filePath.slice(env.componentsHome.length + 1).split(".")[0];
  name = "component:" + name;
  componentsPartials.push(name);
  return handlebars.registerPartial(name, handlebars.compile(hbs.toString()));
};

function findComponentLayout() {
  var filePaths = glob.sync(env.componentsHome + '/**/{all_templates,other_templates,templates}/*.hbs');
  return _.map(filePaths, registerComponentLayout);
};
findComponentLayout();

fileWatcher.watchFiles(env.componentsHome, {
  filter: function(fullPath) {
    return !/\S*\/(all_templates|other_templates|templates)\/\w+.hbs$/.test(fullPath);
  }
}, function(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  if (fs.statSync(filePath).isDirectory()) {
    return;
  }
  try {
    registerComponentLayout(filePath);
    return console.log("[component Reload] " + filePath);
  } catch (error) {
    return console.log("component Reload Error] " + filePath + " - " + error);
  }
});


var blocks = {};
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
    } else {
      return "";
    }
  } else {
    var content = block.join("\n");
    blocks[name] = [];
    return content;
  }
});

function registerLayout(filePath) {
  if (!/\.hbs$/.test(filePath)) {
    return;
  }
  var hbs = fs.readFileSync(filePath);
  var name = filePath.slice(env.viewsHome.length + 1).split(".")[0];
  if (env.oldMode) {
    name = "views/" + name;
  }
  return handlebars.registerPartial(name, handlebars.compile(hbs.toString()));
};

var layouts = [];
function findLayouts(dir) {
  if (!fs.existsSync(dir)) {
    console.error('viewsHome is not exist', dir);
    return;
  }
  var files = fs.readdirSync(dir);
  return files.forEach(function(file) {
    var filePath = dir + "/" + file;
    if (fs.statSync(filePath).isDirectory()) {
      return findLayouts(filePath);
    } else {
      return layouts.push(filePath);
    }
  });
};
findLayouts(env.viewsHome);

layouts.forEach(function(file) {
  return registerLayout(file);
});

fileWatcher.watchFiles(env.viewsHome, function(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  if (fs.statSync(filePath).isDirectory()) {
    return;
  }
  try {
    registerLayout(filePath);
    return console.log("[Layout Reload] " + filePath);
  } catch (error) {
    return console.log("Layout Reload Error] " + filePath + " - " + error);
  }
});

function normalizePath(path) {
  if (path[0] === "/") {
    return path.slice(1);
  } else {
    return path;
  }
};

function getRealPath(path) {
  if (env.pageMode) {
    return env.viewsHome + "/" + (normalizePath(path)) + "/view.hbs";
  } else {
    return env.viewsHome + "/" + (normalizePath(path)) + ".hbs";
  }
};

function getComponentViewPath(path) {
  return env.componentsHome + "/" + (normalizePath(path)) + "/view.hbs";
};

function renderFromRealPath(path, context) {
  var template = templateLoader.fromPathSync(path);
  return template(context);
};

module.exports = {

  renderFile: function(path, context) {
    return renderFromRealPath(getRealPath(path), context);
  },

  renderComponent: function(path, context) {
    context = context || {};
    context[this.CONST.COMP_PATH] = path;
    try {
      return renderFromRealPath(getComponentViewPath(path), context);
    } catch (error) {
      if (err instanceof FileNotFoundError) {
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
