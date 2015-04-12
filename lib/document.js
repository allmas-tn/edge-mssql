'use strict';

function Document() {
}

Document.prototype = {
  assign: function(data, safe) {
    if (!data) return;

    if (safe)
      data = this.schema.filter(data, true);

    Object.keys(data).forEach(function(key) {
      this[key] = data[key];
    }.bind(this));
  },
  toObject: function(virtuals) {
    var obj = {};

    this.schema.properties(virtuals).forEach(function(prop) {
      obj[prop] = this[prop];
    }.bind(this));

    return obj;
  },
  toJSON: function() {
    return this.toObject(false);
  }
};

module.exports = Document;
