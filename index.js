
var express = require("express");

var env = require("./lib/enviroments");

app = express();

require('./lib/routes')(app);

app.listen(env.serverPort);

console.log("server listening at port: " + env.serverPort);
