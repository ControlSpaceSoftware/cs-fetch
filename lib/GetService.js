'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createCORSRequest = createCORSRequest;
exports.default = getServiceFactory;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GetService = exports.GetService = function () {
	function GetService(getAuthorization, xhrFactory) {
		_classCallCheck(this, GetService);

		this.getAuthorization = getAuthorization;
		this.get = this.get.bind(this, xhrFactory);
	}

	_createClass(GetService, [{
		key: 'get',
		value: function get(xhrFactory, url, headers) {
			var _this = this;

			var isSecure = /^https:/i.test(url);

			if (!isSecure) {
				throw new TypeError('url must use https protocol');
			}

			var xhr = xhrFactory('GET', url);
			var xhrPromise = new Promise(function (resolve, reject) {
				if (!xhr) {
					reject(new TypeError('CORS not supported'));
					return;
				}
				xhr.onload = function () {
					resolve({
						text: function text() {
							return xhr.responseText;
						},
						json: function json() {
							return JSON.parse(xhr.responseText);
						}
					});
				};
				xhr.onerror = function (err) {
					reject(err);
				};
				xhr.onabort = function () {
					reject('aborted');
				};
				_this.getAuthorization().then(function (token) {
					headers = Object.assign({}, {
						'Content-Type': 'application/json',
						'Authorization': token.jwt }, headers);
					Object.keys(headers).forEach(function (key) {
						xhr.setRequestHeader(key, headers[key]);
					});
					xhr.send();
				}).catch(function (err) {
					reject(err);
				});
			});

			return {
				abort: function abort() {
					xhr.abort();
					return xhrPromise;
				},
				then: function then(fn) {
					return xhrPromise.then(fn);
				},
				catch: function _catch(fn) {
					return xhrPromise.catch(fn);
				}
			};
		}
	}]);

	return GetService;
}();

function createCORSRequest(method, url) {
	if (typeof XMLHttpRequest !== 'undefined') {
		var xhr = new XMLHttpRequest();
		if ('withCredentials' in xhr) {
			// XHR for Chrome/Firefox/Opera/Safari.
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest !== 'undefined') {
			// XDomainRequest for IE.
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			// CORS not supported.
			xhr = null;
		}
		return xhr;
	}
}

function getServiceFactory(_ref) {
	var getAuthorization = _ref.getAuthorization,
	    abortLast = _ref.abortLast,
	    xhrFactory = _ref.xhrFactory;


	var lastGet = void 0;

	if (!(getAuthorization && typeof getAuthorization === 'function')) {
		throw new TypeError('required "getAuthorization" parameter must be a function');
	}

	// we inject xhrFactory so we can test function with 100% coverage
	xhrFactory = xhrFactory || createCORSRequest;

	if (!(xhrFactory && typeof xhrFactory === 'function')) {
		throw new TypeError('required "xhrFactory" parameter must be a function');
	}

	var getService = new GetService(getAuthorization, xhrFactory);

	if (abortLast) {
		return function (url, headers) {
			if (lastGet) {
				try {
					lastGet.abort();
				} catch (ignore) {}
				lastGet = null;
			}
			return lastGet = getService.get(url, headers);
		};
	}

	return function (url, headers) {
		return getService.get(url, headers);
	};
}