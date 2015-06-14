"use strict";
require('babel/register');


var app = require('./app');

var server = app.listen(process.env.PORT || 3000, function() { console.log('App running at http://%s:%s', server.address().address, server.address().port); });
