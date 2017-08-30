export class PostService {

	constructor(fetch, getAuthorization) {
		this.getAuthorization = getAuthorization;
		this.post = this.post.bind(this, fetch);
	}

	get options() {
		return {
			mode: 'cors',
			headers: {'Content-Type': 'application/json'}
		};
	}

	post(fetch, url, body, headers = {}) {

		const isSecure = /^https:/i.test(url);

		if (!isSecure) {
			throw new TypeError('url must use https protocol');
		}

		return new Promise((resolve, reject) => {
			this.getAuthorization().then(({jwt, expiresOn}) => {
				const options = this.options;
				Object.assign(options.headers, headers);
				options.headers['Authorization'] = jwt;
				options.method = 'POST';
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

export default function PostServiceFactory({getAuthorization, fetch}) {

	if (!(fetch && typeof fetch === 'function')) {
		throw new TypeError('required "fetch" parameter must be a function');
	}

	if (!(getAuthorization && typeof getAuthorization === 'function')) {
		throw new TypeError('required "getAuthorization" parameter must be a function');
	}

	const postService = new PostService(fetch, getAuthorization);

	return (url, body, headers) => postService.post(url, body, headers);

};
