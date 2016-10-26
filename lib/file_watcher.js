var _ = require("lodash");
var chokidar = require('chokidar');

var config = require("./config");
var partialRegister = require('./handlebars/partial_register');
var dataProvider = require('./data_provider');

/**
 * 监听templates components目录
 */
chokidar.watch(config.componentsHome).on('change', function(filePath) {
  if (!fs.existsSync(filePath)
  || fs.statSync(filePath).isDirectory()
  // 如果不是templates目录，不reload
  || !/\S*\/(all_templates|other_templates|templates)\/\w+.hbs$/.test(filePath)
  ) {
    return;
  }

  try {
    partialRegister.registerTemplateComp(filePath);
    console.log("[component Reload] " + filePath);
  } catch (error) {
    console.log("component Reload Error] " + filePath + " - " + error);
  }
});

/**
 * 监听views目录
 */
chokidar.watch(config.viewsHome).on('change', function(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return;
  }
  try {
    partialRegister.registerLayout(filePath);
    console.log("[Layout Reload] " + filePath);
  } catch (error) {
    console.log("Layout Reload Error] " + filePath + " - " + error);
  }
});

/**
 * 监听data目录
 */
chokidar.watch(config.dataFiles).on('change', function(dataFilePath) {
  require.cache[dataFilePath] = null;
  try {
    dataProvider.loadData(dataFilePath);
    console.log("[Data Reload] " + dataFilePath);
  } catch (error) {
    console.log("[Data Reload Error] " + dataFilePath + " - " + error);
  }
});
