'use strict';

var Schema = exports.Schema = require('./schema');
var Model = exports.Model = require('./model');
var Document = exports.Document = require('./document');

exports.init = function(config) {
  require('./driver').init(config);
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
