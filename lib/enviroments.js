var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var commander = require("commander");

var config = {
    serverPort: 8080,
    filesHome: "public",
    viewsHome: void 0,
    componentsHome: void 0,
    dataFiles: [],
    extraHelpers: [],
    oldMode: false,
    pageMode: false,
    assetsPrefix: void 0
  };

var env = process.env.NODE_ENV || "dev";
var configFilePath = "jiggly.json";
var port = 8080;

var packageJson = require('../package.json');
if (env !== "test") {
  commander
  .version("zcyjiggly version: " + packageJson.version)
  .usage("[options] [file], file default: jiggly.json")
  .option("-p, --port [port]", "Use the specified port, will override port config in config.json.");

  commander.on("--help", function() {
    console.log("  Examples:");
    console.log("");
    console.log("    $ jiggly");
    console.log("    $ jiggly config.json");
    return console.log("    $ jiggly -p 8000");
  });
  commander.parse(process.argv);
  if (!_.isEmpty(commander.args)) {
    configFilePath = commander.args[0];
  }
  if (commander.port !== void 0) {
    port = parseInt(commander.port);
    if (_.isNaN(port)) {
      commander.help();
    }
  }
}

var configFile = path.resolve(process.cwd(), configFilePath);
var basePath = path.dirname(configFile);

if (fs.existsSync(configFile)) {
  var outerConfig = require(configFile);
  _.assign(config, outerConfig);
  delete config.env;
  if (outerConfig.env) {
    _.assign(config, outerConfig.env[env]);
  }
}

config.filesHome = path.resolve(basePath, config.filesHome);

if (config.viewsHome) {
  config.viewsHome = path.resolve(basePath, config.viewsHome);
} else {
  config.viewsHome = path.resolve(basePath, config.filesHome, "views");
}

if (config.componentsHome) {
  config.componentsHome = path.resolve(basePath, config.componentsHome);
} else {
  config.componentsHome = path.resolve(basePath, config.filesHome, "components");
}

config.dataFiles = _.map(config.dataFiles, function(dataFile) {
  return path.resolve(basePath, dataFile);
});

config.extraHelpers = _.map(config.extraHelpers, function(helperFile) {
  return path.resolve(basePath, helperFile);
});

if (commander.port !== void 0) {
  port = parseInt(commander.port);
  if (_.isNaN(port)) {
    commander.help();
  }
  config.serverPort = port;
}

console.log("Config file path: " + configFile);

console.log("Config loaded:");

console.log(config);

module.exports = config;
