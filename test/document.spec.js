'use strict';

var assert = require('assert');
var mssql = require('../');

var table = 'testTable';

var TestSchema = new mssql.Schema({a: Number, b: Number});
TestSchema.virtual('v')
  .set(function(value) {
    this._v = value;
  })
  .get(function() {
    return this._v;
  });

var TesModel = mssql.model(table, TestSchema);

describe('document', function() {
  it('toJSON() should return fields only', function() {
    var doc = new TesModel({a: 1, b: 2});
    doc.v = 3;

    assert.deepEqual(doc.toJSON(), {a: 1, b: 2});
  });

  it('toObject(false) should return fields only', function() {
    var doc = new TesModel({a: 1, b: 2});
    doc.v = 3;

    assert.deepEqual(doc.toObject(false), {a: 1, b: 2});
  });

  it('toObject(true) should return fields and virtuals', function() {
    var doc = new TesModel({a: 1, b: 2});
    doc.v = 3;

    assert.deepEqual(doc.toObject(true), {a: 1, b: 2, v: 3});
  });
});
