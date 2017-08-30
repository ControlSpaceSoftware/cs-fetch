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
get(url)
	.then((response) => response.json())
	.then((result) => console.log(result))
	.catch(console.error);
```

```
import {PostServiceFactory} from 'cs-xhr-wrapper'
const getAuthorization = () => {/* return jwt*/};
const post = PostServiceFactory({fetch, getAuthorization})