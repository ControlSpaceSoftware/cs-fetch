'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _PostService = require('./PostService');

Object.defineProperty(exports, 'postServiceFactory', {
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

Object.defineProperty(exports, 'getServiceFactory', {
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

var _DeleteService = require('./DeleteService');

Object.defineProperty(exports, 'deleteServiceFactory', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_DeleteService).default;
  }
});
Object.defineProperty(exports, 'DELETE', {
  enumerable: true,
  get: function get() {
    return _DeleteService.DeleteService;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }