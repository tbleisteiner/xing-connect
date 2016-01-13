'use strict';

global.config = require('./config.js');
var express = require('express'),
	bodyParser = require('body-parser');

var app = express();

require('./auth').init(app);
require('./conn').init(app);

app.use(bodyParser.urlencoded({
    limit: global.config.maxRequestEntity,
	extended: true
}));

app.get('/', function (req, res) {
    res.send('Hello World');

});

app.get('/callback', function(req, res) {

});

global.user = {};

app.listen(4320);