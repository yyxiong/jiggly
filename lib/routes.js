var _ = require("lodash");
var fs = require("fs");
var path = require('path');

var config = require("./config");
var render = require("./handlebars/render");
var dataProvider = require("./data_provider");
var FileNotFoundError = require("./errors").FileNotFoundError;

module.exports = function(app) {
  /* 先查询components页面 */
  app.get(/^([^\.]+)$/, function(req, res, next) {
    var reqPath = req.path;
    var urlDataResult = dataProvider.getUrlData(reqPath, req.query, res);
    var globalData = dataProvider.getGlobalData();
    var context = urlDataResult.found ? _.assign(req.query, urlDataResult.result) : req.query;
    context = _.assign(globalData, context);
    try {
      var result = render.renderFile(reqPath, context);
      return res.send(result);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        return next();
      }
      throw error;
    }
  });

  /* 查询view页面 */
  app.get(/^(.+)$/, function(req, res, next) {
    var reqPath = req.path;
    if (config.assetsPrefix && _.startsWith(reqPath, config.assetsPrefix)) {
      reqPath = reqPath.substring(config.assetsPrefix.length);
    }
    var realPath = path.join(config.filesHome, reqPath);
    if (fs.existsSync(realPath)) {
      return res.sendFile(realPath);
    }
    return next();
  });

  /* 查询data数据 */
  app.all(/^(.+)$/, function(req, res) {
    var reqPath = req.path;
    var dataResult = dataProvider.getUrlData(reqPath, req.query, res);
    if (dataResult.found) {
      return res.send(dataResult.result);
    }
    console.log("[Not Found] " + reqPath);
    res.sendStatus(404);
  });
}