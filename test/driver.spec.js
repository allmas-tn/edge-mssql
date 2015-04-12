'use strict';

var assert = require('assert');
var driver = require('../lib/driver');

var mock_sql = function(params, cb) {
  cb(params);
};

describe('driver', function() {
  it('should throw if not initialised', function() {
    assert.throws(driver._sql, Error);
  });

  describe('commands', function() {
    var table = 'testTable';
    var data = {a: 1, b: 2};

    beforeEach(function() {
      driver._sql = mock_sql;
    });

    it('\'insert\' should call sql with the correct parameters', function() {
      driver.create(table, data, function(params) {
        assert.equal(params.command, 'INSERT INTO ' + table + ' (a, b) OUTPUT INSERTED.* VALUES (@p0, @p1)');
        assert.deepEqual(params.parameters, {p0: 1, p1: 2});
        assert.strictEqual(params.nonQuery, false);
      });
    });

    it('\'update\' should call sql with the correct parameters', function() {
      driver.update(table, {a: 1}, data, function(params) {
        assert.equal(params.command, 'UPDATE ' + table + ' SET a=@p0, b=@p1 WHERE a=@p2');
        assert.deepEqual(params.parameters, {p0: 1, p1: 2, p2: 1});
        assert.strictEqual(params.nonQuery, false);
      });
    });

    it('\'find\' should call sql with the correct parameters', function() {
      driver.find(table, {id: 1, a: 2}, function(params) {
        assert.equal(params.command, 'SELECT * FROM ' + table + ' WHERE id=@p0 AND a=@p1');
        assert.deepEqual(params.parameters, {p0: 1, p1: 2});
        assert.strictEqual(params.nonQuery, false);
      });
    });
  });
});
