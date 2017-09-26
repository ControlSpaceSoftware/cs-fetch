export class DeleteService {

	constructor(fetch, getAuthorization) {
		this.getAuthorization = getAuthorization;
		this.doDelete = this.doDelete.bind(this, fetch);
	}

	get options() {
		return {
			mode: 'cors',
			headers: {'Content-Type': 'application/json'}
		};
	}

	doDelete(fetch, url, body, headers = {}) {

		const isSecure = /^https:/i.test(url);

		if (!isSecure) {
			throw new TypeError('url must use https protocol');
		}

		return new Promise((resolve, reject) => {
			this.getAuthorization().then(({jwt, expiresOn}) => {
				const options = this.options;
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

}

export default function deleteServiceFactory({getAuthorization, fetch}) {

	// we inject fetch so we can test function with 100% coverage

	// default to the browser fetch api if it exists
	fetch = fetch || (typeof window !== 'undefined' ? window.fetch : null);

	if (!(fetch && typeof fetch === 'function')) {
		throw new TypeError('required "fetch" parameter must be a function');
	}

	if (!(getAuthorization && typeof getAuthorization === 'function')) {
		throw new TypeError('required "getAuthorization" parameter must be a function');
	}

	const service = new DeleteService(fetch, getAuthorization);

	return (url, body, headers) => service.doDelete(url, body, headers);

};
