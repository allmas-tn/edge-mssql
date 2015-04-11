'use strict';

var Schema = function(definition) {
  this.fields = {};
  this.methods = undefined;
  this.statics = undefined;

  this.add(definition);
};

Schema.prototype.add = function(definition) {
  if (!definition)
    return;

  Object.keys(definition).forEach(function(key) {
    var def = definition[key];

    if (!def)
      throw new Error('Invalid schema definition.');

    if (!def.type)
      def = {type: def};

    var setter = function(value) {
      this._doc[key] = value;
    };

    var getter = function() {
      return this._doc[key];
    };

    if (def.type == String) {
      setter = function(value) {
        this._doc[key] = (value || '').toString();
      };
    }
    else if (def.type == Number) {
      setter = function(value) {
        var v = Number(value);
        if (isNaN(v))
          throw new Error('Could not cast value to Number: ' + value);

        this._doc[key] = v;
      };
    }
    else if (def.type == Date) {
      setter = function(value) {
        var v = (value instanceof Date) ? value : new Date(value);
        if (v.toString() == 'Invalid Date')
          throw new Error('Could not cast value to Date: ' + value);

        this._doc[key] = v;
      };
    }

    this.fields[key] = {
      definition: def,
      getter: getter,
      setter: setter
    };
  }.bind(this));
};

Schema.prototype.compile = function(prototype, table) {
  // add fields
  Object.keys(this.fields).forEach(function(key) {
    var field = this.fields[key];

    Object.defineProperty(prototype, key, {
      enumerable: true,
      configurable: true,
      get: field.getter,
      set: field.setter
    })
  }.bind(this));

  // add instance methods
  if (this.methods) {
    Object.keys(this.methods).forEach(function(method) {
      prototype[method] = this.methods[method];
    }.bind(this));
  }

  prototype.table = table;
  prototype.schema = this;
};

/**
 * Returns a new object that contains only properties from 'data' that are part of the schema.
 *
 * @param data object to filter
 * @returns {{}} new filtered object
 */
Schema.prototype.filter = function(data) {
  var filtered = {};

  if (data) {
    Object.keys(this.fields).forEach(function(key) {
      if (data[key] !== undefined)
        filtered[key] = data[key];
    }.bind(this));
  }

  return filtered;
};

module.exports = Schema;

