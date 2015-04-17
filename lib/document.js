'use strict';

function Document() {
}

Document.prototype.assign = function(data, safe) {
  if (!data) return;

  if (safe)
    data = this.schema.filter(data, true);

  Object.keys(data).forEach(function(key) {
    this[key] = data[key];
  }.bind(this));
};

Document.prototype.toObject = function(virtuals) {
  var obj = {};

  this.schema.properties(virtuals).forEach(function(prop) {
    obj[prop] = this[prop];
  }.bind(this));

  return obj;
};

Document.prototype.toJSON = function() {
  return this.toObject(false);
};

Document.prototype.save = function(cb) {
  if (this.id) {
    this.constructor.update({id: this.id}, this.toObject(false), function(err) {
      if (err) return cb(err);

      cb(null, this);
    }.bind(this));
  }
  else {
    this.constructor.create(this, cb);
  }
};

module.exports = Document;
