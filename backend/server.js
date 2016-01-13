'use strict';

global.config = require('./config.js');
var express = require('express');

var app = express();

require('./auth').init(app);
require('./conn').init(app);

app.get('/', function (req, res) {
    res.send('Hello World');

});

app.get('/callback', function(req, res) {

});

app.listen(4320);