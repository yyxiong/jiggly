var _ = require("lodash");
var fs = require("fs");
var express = require("express");

var env = require("./enviroments");
var render = require("./handlebars/render");
var dataProvider = require("./data_provider");
var FileNotFoundError = require("./errors").FileNotFoundError;

require("./polyfill");

app = express();

app.get(/^([^\.]+)$/, function(req, res, next) {
  var path = req.params[0];
  var urlDataResult = dataProvider.getUrlData(path, req.query, res);
  var globalData = dataProvider.getGlobalData();
  var context = _.isPlainObject(urlDataResult.result) ? _.assign(req.query, urlDataResult.result) : req.query;
  context = _.assign(globalData, context);
  try {
    var result = render.renderFile(path, context);
    return res.send(result);
  } catch (error) {
    if (error instanceof FileNotFoundError) {
      return next();
    } else {
      throw error;
    }
  }
});

app.get(/^(.+)$/, function(req, res, next) {
  var path = req.params[0];
  if (env.assetsPrefix !== void 0 && path.startsWith(env.assetsPrefix)) {
    path = path.substring(env.assetsPrefix.length);
  }
  var realPath = "" + env.filesHome + path;
  if (fs.existsSync(realPath)) {
    return res.sendFile(realPath);
  } else {
    return next();
  }
});

app.all(/^(.+)$/, function(req, res) {
  var path = req.params[0];
  var dataResult = dataProvider.getUrlData(path, req.query, res);
  if (dataResult.found) {
    return res.send(dataResult.result);
  } else {
    console.log("[Not Found] " + path);
    res.status(404);
    return res.send();
  }
});

app.listen(env.serverPort);

console.log("server listening at port: " + env.serverPort);
