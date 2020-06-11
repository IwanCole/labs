// STANDARD STUFF
var express = require('express');
var WebSocket = require('ws');
var util   = require('util');
var path = require('path');

var app = express();
// const wss = new WebSocket.Server({ port: 8080 });

var staticPath = path.join(__dirname, '/public');
app.use(express.static(staticPath));

app.get("/", function(req, res) {
    res.sendFile("/public/");
});

var port = process.env.PORT || 80;

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});
