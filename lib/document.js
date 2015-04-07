'use strict';

function Document() {
}

Document.prototype = {
  toJSON: function() {
    return this._doc;
  }
};

module.exports = Document;
