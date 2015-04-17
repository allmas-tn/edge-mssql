'use strict';

var debug = require('debug');

exports.debug = debug('edge-mssql:debug');
exports.info = debug('edge-mssql:info');
exports.warn = debug('edge-mssql:warn');
exports.error = debug('edge-mssql:error');
