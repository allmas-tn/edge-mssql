'use strict';

var Schema = exports.Schema = require('./lib/schema');
var Model = exports.Model = require('./lib/model');
var Document = exports.Document = require('./lib/document');

exports.init = function(config) {
  require('./lib/driver').init(config);
};

exports.model = function(table, schema) {
  var ModelClass = function(data) {
    this._doc = {};
    this.assign(data, true);
  };

  // instances are documents
  ModelClass.prototype = new Document();
  ModelClass.prototype.constructor = ModelClass;

  // compile model (adds class fields and methods)
  Model.compile(ModelClass, table, schema);

  // compile schema (adds instance fields and methods)
  schema.compile(ModelClass.prototype, table);

  return ModelClass;
};
