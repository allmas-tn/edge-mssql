'use strict';

var driver = require('./driver');

module.exports = {
  compile: function(ModelClass, table, schema) {
    // add static model methods
    Object.keys(statics).forEach(function(method) {
      ModelClass[method] = statics[method];
    }.bind(this));

    // add static schema methods
    if (schema.statics) {
      Object.keys(schema.statics).forEach(function(method) {
        ModelClass[method] = schema.statics[method];
      }.bind(this));
    }

    ModelClass.table = table;
    ModelClass.schema = schema;
  }
};

var statics = {
  create: function(data, cb) {
    var v = values(this.schema.filter(data), true);
    if (!v) return cb(null, null);

    var sql = 'INSERT INTO ' + this.table + v;

    driver.query(sql, data, function(err, res) {
      if (err) return cb(err);

      cb(null, this._build(res[0]));
    }.bind(this));
  },
  update: function(query, data, cb) {
    var s = set(this.schema.filter(data), true);
    if (!s) return cb(null, []);

    var sql = 'UPDATE ' + this.table + s + where(query);

    driver.query(sql, data, function(err, res) {
      if (err) return cb(err);
      if (!res || !res.length) return cb(null, []);

      cb(null, this._build(res));
    }.bind(this));
  },
  find: function(query, cb) {
    var sql = 'SELECT * FROM ' + this.table + where(this.schema.filter(query));

    driver.query(sql, query, function(err, res) {
      if (err) return cb(err);
      if (!res || !res.length) return cb(null, []);

      cb(null, this._build(res));
    }.bind(this));
  },
  findOne: function(query, cb) {
    this.find(query, function(err, res) {
      if (err) return cb(err);
      if (!res.length) return cb(null, null);

      cb(null, res[0]);
    });
  },
  _build: function(objects) {
    var items = Array.isArray(objects) ? objects : [objects];

    var models = items.map(function(item) {
      return new this.prototype.constructor(item);
    }.bind(this));

    return Array.isArray(objects) ? models : models[0];
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
