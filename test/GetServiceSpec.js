/*global describe, it, beforeEach*/

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import {GetServiceFactory} from '../src'

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

describe('GetServiceFactory', () => {
	let xhr, xhrFactory, getAuthorization;
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
		getAuthorization = sinon.stub().returns(Promise.resolve({jwt: 'test jwt'}));
	});
	it('exits', () => {
		expect(GetServiceFactory).to.be.a('function');
	});
	it('throws missing getAuthorization function', () => {
		expect(GetServiceFactory.bind(null, null)).to.throw('required "getAuthorization" parameter must be a function');
	});
	it('throws missing xhrFactory function', () => {
		expect(GetServiceFactory.bind(null, getAuthorization, null)).to.throw('required "xhrFactory" parameter must be a function');
	});
	describe('get(url, headers)', () => {
		it('returns get results', () => {
			const get = GetServiceFactory(getAuthorization, xhrFactory);
			return get('https://test.com/url').then((result) => {
				expect(result.json()).to.eql({test: 'get resolve'});
			});
		});
		it('does not call xhr.send() if getAuthorization fails', () => {
			xhr.send = sinon.spy();
			getAuthorization = sinon.stub().returns(Promise.reject({test: 'getAuthorization reject'}));
			const get = GetServiceFactory(getAuthorization, xhrFactory);
			return get('https://test.com/url').catch((result) => {
				expect(result).to.eql({test: 'getAuthorization reject'});
				expect(xhr.send).not.to.have.been.called;
			});
		});
		it('sets the Authorization and CORS options', () => {
			const get = GetServiceFactory(getAuthorization, xhrFactory);
			return get('https://test url').then((result) => {
				expect(xhr.headers).to.eql({
					Authorization: "test jwt",
					'Content-Type': "application/json"
				});
			});
		});
	});
});
