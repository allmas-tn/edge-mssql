'use strict';

var Virtual = require('./virtual');

var Schema = function(definition) {
  this.fields = {};
  this.virtuals = {};
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
        if (value !== undefined && value !== null)
          value = value.toString();

        this._doc[key] = value;
      };
    }
    else if (def.type == Number) {
      setter = function(value) {
        var v = value;

        if (value !== undefined && value !== null) {
          v = Number(value);

          if (isNaN(v))
            throw new Error('Could not cast value to Number: ' + value);
        }

        this._doc[key] = v;
      };
    }
    else if (def.type == Date) {
      setter = function(value) {
        var v = value;

        if (value !== undefined && value !== null) {
          v = (value instanceof Date) ? value : new Date(value);

          if (v.toString() == 'Invalid Date')
            throw new Error('Could not cast value to Date: ' + value);
        }

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

  // add virtual properties
  Object.keys(this.virtuals).forEach(function(key) {
    var virtual = this.virtuals[key];

    Object.defineProperty(prototype, key, {
      get: virtual.getter,
      set: virtual.setter
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
 * Returns the names of the fields, and optionally, the virtual properties defined in the schema.
 *
 * @param virtuals {Boolean} whether to include virtual properties
 * @returns {Array} list of property names
 */
Schema.prototype.properties = function(virtuals) {
  var keys = Object.keys(this.fields);
  if (virtuals)
    keys = keys.concat(Object.keys(this.virtuals));

  return keys;
};

/**
 * Returns a new object that contains only properties from 'data' that are part of the schema.
 *
 * @param {Object} data object to filter
 * @param {Boolean} virtuals whether to include virtual properties
 * @returns {Object} new filtered object
 */
Schema.prototype.filter = function(data, virtuals) {
  var filtered = {};

  if (data) {
    var keys = this.properties(virtuals);

    keys.forEach(function(key) {
      if (data.hasOwnProperty(key))
        filtered[key] = data[key];
    }.bind(this));
  }

  return filtered;
};

Schema.prototype.virtual = function(name) {
  if (!name) return null;

  if (!this.virtuals[name])
    this.virtuals[name] = new Virtual();

  return this.virtuals[name];
};

module.exports = Schema;

