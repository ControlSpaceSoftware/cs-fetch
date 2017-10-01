export class GetService {

	constructor(getAuthorization, xhrFactory) {
		this.getAuthorization = getAuthorization;
		this.get = this.get.bind(this, xhrFactory);
	}

	get(xhrFactory, url, headers) {

		const isSecure = /^https:/i.test(url);

		if (!isSecure) {
			throw new TypeError('url must use https protocol');
		}

		const xhr = xhrFactory('GET', url);
		const xhrPromise = new Promise((resolve, reject) => {
			if (!xhr) {
				reject(new TypeError('CORS not supported'));
				return;
			}
			xhr.onload = function () {
				resolve({
					text() {
						return xhr.responseText;
					},
					json() {
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
			this.getAuthorization().then((token) => {
				headers = Object.assign({}, {
					'Content-Type': 'application/json',
					'Authorization': token.jwt}, headers);
				Object.keys(headers).forEach((key) => {
					xhr.setRequestHeader(key, headers[key]);
				});
				xhr.send();
			}).catch((err) => {
				reject(err);
			});
		});

		return {
			abort() {
				xhr.abort();
				return xhrPromise;
			},
			then(fn) {
				return xhrPromise.then(fn);
			},
			catch(fn) {
				return xhrPromise.catch(fn)
			}
		};

	}

}

export function createCORSRequest(method, url) {
	if (typeof XMLHttpRequest !== 'undefined') {
		let xhr = new XMLHttpRequest();
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

export default function getServiceFactory({getAuthorization, abortLast, xhrFactory}) {

	let lastGet;

	if (!(getAuthorization && typeof getAuthorization === 'function')) {
		throw new TypeError('required "getAuthorization" parameter must be a function');
	}

	// we inject xhrFactory so we can test function with 100% coverage
	xhrFactory = xhrFactory || createCORSRequest;

	if (!(xhrFactory && typeof xhrFactory === 'function')) {
		throw new TypeError('required "xhrFactory" parameter must be a function');
	}

	const getService = new GetService(getAuthorization, xhrFactory);

	if (abortLast) {
		return (url, headers) => {
			if (lastGet) {
				try {
					lastGet.abort();
				} catch (ignore) {}
				lastGet = null;
			}
			return lastGet = getService.get(url, headers);
		};
	}

	return (url, headers) => getService.get(url, headers);

}
