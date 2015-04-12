'use strict';

var util = require('util');

var connectionString = '';

module.exports = {
  init: function(config) {
    config = config || {};

    if (this._sql === uninitialised_sql) {
      var edge = require('edge');
      this._sql = edge.func(__dirname + '/sql.csx');
    }

    connectionString = config.connectionString;
  },
  create: function(table, data, cb) {
    var v = values(data, true);
    if (!v.sql) return cb(null, null);

    var sql = util.format('INSERT INTO %s%s', table, v.sql);
    this.query(sql, v.params, cb);
  },
  update: function(table, query, data, cb) {
    var params = {};

    var s = set(data, false, params);
    if (!s.sql) return cb(null, []);

    var w = where(query, params);

    var sql = util.format('UPDATE %s%s%s', table, s.sql, w.sql);
    this.query(sql, params, cb);
  },
  find: function(table, query, cb) {
    var w = where(query);

    var sql = util.format('SELECT * FROM %s%s', table, w.sql);
    this.query(sql, w.params, cb);
  },
  exec: function(command, parameters, nonQuery, cb) {
    this._sql({
      connectionString: connectionString,
      command: command,
      parameters: parameters,
      nonQuery: nonQuery
    }, cb);
  },
  query: function(command, parameters, cb) {
    this.exec(command, parameters, false, cb);
  },
  nonQuery: function(command, parameters, cb) {
    this.exec(command, parameters, true, cb);
  },
  _sql: uninitialised_sql
};

function uninitialised_sql() {
  throw new Error('edge-mssql driver has not been initialised.');
}

function generateParams(data, params, cb) {
  var offset = Object.keys(params).length;
  Object.keys(data).forEach(function(key, i) {
    var param = 'p' + (offset + i);
    params[param] = data[key];
    cb(key, param);
  });
}

function values(data, output, params) {
  var columns = [];
  var values = [];
  var sql = '';

  params = params || {};
  generateParams(data, params, function(key, param) {
    columns.push(key);
    values.push('@' + param);
  });

  if (columns.length) {
    var out = output ? ' OUTPUT INSERTED.*' : '';
    sql = util.format(' (%s)%s VALUES (%s)', columns.join(', '), out, values.join(', '));
  }

  return {sql: sql, params: params};
}

function where(query, params) {
  var items = [];
  var sql = '';

  params = params || {};
  generateParams(query, params, function(key, param) {
    items.push(key + '=@' + param);
  });

  if (items.length)
    sql = util.format(' WHERE %s', items.join(' AND '));

  return {sql: sql, params: params};
}

function set(data, output, params) {
  var items = [];
  var sql = '';

  params = params || {};
  generateParams(data, params, function(key, param) {
    items.push(key + '=@' + param);
  });

  if (items.length) {
    var out = output ? ' OUTPUT UPDATED.*' : '';
    sql = util.format(' SET %s%s', items.join(', '), out);
  }

  return {sql: sql, params: params};
}
