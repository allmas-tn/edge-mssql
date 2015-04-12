'use strict';

var Virtual = function() {
};

Virtual.prototype.get = function(getter) {
  this.getter = getter;
  return this;
};

Virtual.prototype.set = function(setter) {
  this.setter = setter;
  return this;
};

module.exports = Virtual;
