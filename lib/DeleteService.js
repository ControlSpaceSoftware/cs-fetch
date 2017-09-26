'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = deleteServiceFactory;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeleteService = exports.DeleteService = function () {
	function DeleteService(fetch, getAuthorization) {
		_classCallCheck(this, DeleteService);

		this.getAuthorization = getAuthorization;
		this.doDelete = this.doDelete.bind(this, fetch);
	}

	_createClass(DeleteService, [{
		key: 'doDelete',
		value: function doDelete(fetch, url, body) {
			var _this = this;

			var headers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


			var isSecure = /^https:/i.test(url);

			if (!isSecure) {
				throw new TypeError('url must use https protocol');
			}

			return new Promise(function (resolve, reject) {
				_this.getAuthorization().then(function (_ref) {
					var jwt = _ref.jwt,
					    expiresOn = _ref.expiresOn;

					var options = _this.options;
					Object.assign(options.headers, headers);
					options.headers['Authorization'] = jwt;
					options.method = 'DELETE';
					if (typeof body === 'string') {
						options.body = body;
					} else {
						options.body = JSON.stringify(body);
					}
					fetch(url, options).then(resolve).catch(reject);
				}).catch(reject);
			});
		}
	}, {
		key: 'options',
		get: function get() {
			return {
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' }
			};
		}
	}]);

	return DeleteService;
}();

function deleteServiceFactory(_ref2) {
	var getAuthorization = _ref2.getAuthorization,
	    fetch = _ref2.fetch;


	// we inject fetch so we can test function with 100% coverage

	// default to the browser fetch api if it exists
	fetch = fetch || (typeof window !== 'undefined' ? window.fetch : null);

	if (!(fetch && typeof fetch === 'function')) {
		throw new TypeError('required "fetch" parameter must be a function');
	}

	if (!(getAuthorization && typeof getAuthorization === 'function')) {
		throw new TypeError('required "getAuthorization" parameter must be a function');
	}

	var service = new DeleteService(fetch, getAuthorization);

	return function (url, body, headers) {
		return service.doDelete(url, body, headers);
	};
};