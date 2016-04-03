'use strict';

(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.FileBrowser = factory();
  }
}(this, function () {
  
  var FB = {};