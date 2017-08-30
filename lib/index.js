'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PostService = require('./PostService');

Object.defineProperty(exports, 'PostServiceFactory', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PostService).default;
  }
});
Object.defineProperty(exports, 'POST', {
  enumerable: true,
  get: function get() {
    return _PostService.PostService;
  }
});

var _GetService = require('./GetService');

Object.defineProperty(exports, 'GetServiceFactory', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_GetService).default;
  }
});
Object.defineProperty(exports, 'GET', {
  enumerable: true,
  get: function get() {
    return _GetService.GetService;
  }
});

var _GetAbortLastService = require('./GetAbortLastService');

Object.defineProperty(exports, 'GetAbortLastService', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_GetAbortLastService).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }