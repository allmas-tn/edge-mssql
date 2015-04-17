'use strict';

var driver = require('./driver');
var Document = require('./document');

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
    var doc = data instanceof Document ? data : new this.prototype.constructor(data);

    driver.create(this.table, doc.toObject(false), function(err, res) {
      if (err) return cb(err);

      doc.assign(res[0]);
      cb(null, doc);
    });
  },
  update: function(query, data, cb) {
    driver.update(this.table, this.schema.filter(query), this.schema.filter(data), function(err, res) {
      if (err) return cb(err);
      if (!res || !res.length) return cb(null, []);

      cb(null, this._build(res));
    }.bind(this));
  },
  find: function(query, cb) {
    driver.find(this.table, this.schema.filter(query), function(err, res) {
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
