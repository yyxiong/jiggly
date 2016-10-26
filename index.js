
var express = require("express");

var config = require("./lib/config");

app = express();

require('./lib/express')(app);

require('./lib/routes')(app);

require('./lib/file_watcher');

app.listen(config.serverPort);

console.log("server listening at port: " + config.serverPort);
