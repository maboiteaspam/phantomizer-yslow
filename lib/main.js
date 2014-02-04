'use strict';

var path = require('path');

// yslow Node module
// ----------
// to get phantomjs reporters path use
// require("phantomizer-yslow").path;
(function(exports) {
  exports.path = path.resolve(__dirname+"/../vendors/")+"/yslow.js";

}(typeof exports === 'object' && exports || this));