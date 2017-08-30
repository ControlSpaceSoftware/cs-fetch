export class GetService {

	constructor(loadIdToken, xhrFactory) {
		this.loadIdToken = loadIdToken;
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
				reject(new TypeError('cors not supported'));
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
			this.loadIdToken().then((token) => {
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

export default function GetServiceFactory(loadIdToken, xhrFactory = createCORSRequest) {

	if (!(loadIdToken && typeof loadIdToken === 'function')) {
		throw new TypeError('required "loadIdToken" parameter must be a function');
	}

	if (!(xhrFactory && typeof xhrFactory === 'function')) {
		throw new TypeError('required "xhrFactory" parameter must be a function');
	}

	const getService = new GetService(loadIdToken, xhrFactory);

	return (url, headers) => getService.get(url, headers);

}
