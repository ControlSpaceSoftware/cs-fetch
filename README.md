# cs-xhr-wrapper
wrap xhr with authorization and cancel

## Install

```
npm install --save github:ControlSpaceSoftware/cs-xhr-wrapper
```

## Usage

```
import {GetServiceFactory} from 'cs-xhr-wrapper'
const getAuthorization = () => {/* return jwt*/};
const get = GetServiceFactory(getAuthorization);
const api = get(url, headers)
	.then((response) => response.json())
	.then((result) => console.log(result))
	.catch(console.error);
	// if you need to abort request
	api.abort();
```

```
import {PostServiceFactory} from 'cs-xhr-wrapper'
const getAuthorization = () => {/* return jwt*/};
// inject the fetch api object
const post = PostServiceFactory(fetch, getAuthorization);
post(url, body, headers)
	.then((response) => response.json())
	.then((result) => console.log(result))
	.catch(console.error);
// no abort api on post service
```
