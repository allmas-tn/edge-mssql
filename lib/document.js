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
  toJSON: function() {
    return this._doc;
  }
};

module.exports = Document;
