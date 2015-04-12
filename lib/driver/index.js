'use strict';

var edge = require('edge');
var sql = edge.func(__dirname + '/sql.csx');

var connectionString = '';

module.exports = {
  init: function(config) {
    connectionString = config.connectionString;
  },
  create: function(table, data, cb) {
    var v = values(data, true);
    if (!v) return cb(null, null);

    var sql = 'INSERT INTO ' + table + v;
    this.query(sql, data, cb);
  },
  update: function(table, query, data, cb) {
    var s = set(data);
    if (!s) return cb(null, []);

    var sql = 'UPDATE ' + table + s + where(query);
    this.query(sql, data, cb);
  },
  find: function(table, query, cb) {
    var sql = 'SELECT * FROM ' + table + where(query);
    this.query(sql, query, cb);
  },
  exec: function(command, parameters, nonQuery, cb) {
    sql({
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
  }
};

function values(data, output) {
  var columns = [];
  var values = [];

  Object.keys(data).forEach(function(key) {
    columns.push(key);
    values.push('@' + key);
  });

  if (!columns.length) return '';

  var sql = ' (' + columns.join(', ') + ')';
  if (output)
    sql += ' OUTPUT INSERTED.*';

  sql += ' VALUES (' + values.join(', ') + ')';

  return sql;
}

function where(query) {
  var items = Object.keys(query).map(function(key) {
    return key + ' = @' + key;
  });

  return items.length ? (' WHERE ' + items.join(' AND ')) : '';
}

function set(data, output) {
  var items = Object.keys(data).map(function(key) {
    return key + ' = @' + key;
  });

  if (!items.length)
    return '';

  var sql = ' SET ' + items.join(', ');
  if (output)
    sql += ' OUTPUT UPDATED.*';

  return sql;
}
