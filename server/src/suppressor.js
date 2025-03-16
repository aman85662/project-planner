// This file suppresses specific deprecation warnings
const util = require('util');
const originalEmitWarning = process.emitWarning;

// Completely suppress warnings
process.emitWarning = function(warning, type, code, ...args) {
  if (code === 'DEP0061' || (type === 'DeprecationWarning' && String(warning).includes('util._extend'))) {
    // Silently ignore this specific deprecation
    return;
  }
  return originalEmitWarning.call(this, warning, type, code, ...args);
};

// Replace util._extend with Object.assign
if (util._extend) {
  util._extend = Object.assign;
}

// Override console.warn to filter out specific deprecation warnings
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('util._extend')) {
    return;
  }
  return originalWarn.apply(console, args);
};

module.exports = { patched: true }; 