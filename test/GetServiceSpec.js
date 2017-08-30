/*global describe, it, beforeEach*/

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import {GetServiceFactory} from '../src'

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

describe('GetServiceFactory', () => {
	let xhr, xhrFactory, loadIdToken;
	beforeEach(() => {
		xhr = {
			headers: {},
			responseText: null,
			open: sinon.stub(),
			set onload(fn) {
				this._onload = fn;
			},
			setRequestHeader(name, value) {
				this.headers[name] = value;
			},
			send() {
				this.responseText = JSON.stringify({test: 'get resolve'});
				this._onload();
			}
		};
		xhrFactory = () => {
			return xhr;
		};
		loadIdToken = sinon.stub().returns(Promise.resolve({jwt: 'test jwt'}));
	});
	it('exits', () => {
		expect(GetServiceFactory).to.be.a('function');
	});
	it('throws missing loadIdToken function', () => {
		expect(GetServiceFactory.bind(null, null)).to.throw('required "loadIdToken" parameter must be a function');
	});
	it('throws missing xhrFactory function', () => {
		expect(GetServiceFactory.bind(null, loadIdToken, null)).to.throw('required "xhrFactory" parameter must be a function');
	});
	describe('get(url, headers)', () => {
		it('returns get results', () => {
			const get = GetServiceFactory(loadIdToken, xhrFactory);
			return get('https://test.com/url').then((result) => {
				expect(result.json()).to.eql({test: 'get resolve'});
			});
		});
		it('does not call xhr.send() if loadIdToken fails', () => {
			xhr.send = sinon.spy();
			loadIdToken = sinon.stub().returns(Promise.reject({test: 'loadIdToken reject'}));
			const get = GetServiceFactory(loadIdToken, xhrFactory);
			return get('https://test.com/url').catch((result) => {
				expect(result).to.eql({test: 'loadIdToken reject'});
				expect(xhr.send).not.to.have.been.called;
			});
		});
		it('sets the Authorization and CORS options', () => {
			const get = GetServiceFactory(loadIdToken, xhrFactory);
			return get('https://test url').then((result) => {
				expect(xhr.headers).to.eql({
					Authorization: "test jwt",
					'Content-Type': "application/json"
				});
			});
		});
	});
});
