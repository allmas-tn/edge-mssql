'use strict';

var edge = require('edge');
var sql = edge.func(__dirname + '/sql.csx');

var connectionString = '';

exports.init = function(config) {
  connectionString = config.connectionString;
};

exports.exec = function(command, parameters, nonQuery, cb) {
  sql({
    connectionString: connectionString,
    command: command,
    parameters: parameters,
    nonQuery: nonQuery
  }, cb);
};

exports.query = function(command, parameters, cb) {
  this.exec(command, parameters, false, cb);
};

exports.nonQuery = function(command, parameters, cb) {
  this.exec(command, parameters, true, cb);
};

