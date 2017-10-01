/*global describe, it, beforeEach*/

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import {getServiceFactory} from '../src'

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

describe('getServiceFactory', () => {
	let xhr, xhrFactory, getAuthorization;
	beforeEach(() => {
		xhr = {
			headers: {},
			responseText: null,
			open: sinon.stub(),
			set onload(fn) {
				this._onload = fn;
			},
			set onabort(fn) {
				this._onabort = fn;
			},
			setRequestHeader(name, value) {
				this.headers[name] = value;
			},
			send() {
				this.responseText = JSON.stringify({test: 'get resolve'});
				this._onload();
			},
			abort() {
				this._onabort();
			}
		};
		xhrFactory = () => {
			return xhr;
		};
		getAuthorization = sinon.stub().returns(Promise.resolve({jwt: 'test jwt'}));
	});
	it('exits', () => {
		expect(getServiceFactory).to.be.a('function');
	});
	it('throws missing getAuthorization function', () => {
		expect(getServiceFactory.bind(null, {})).to.throw('required "getAuthorization" parameter must be a function');
	});
	it('throws xhrFactory is not a function', () => {
		expect(getServiceFactory.bind(null, {getAuthorization, xhrFactory: 'foo'})).to.throw('required "xhrFactory" parameter must be a function');
	});
	describe('get(url, headers)', () => {
		it('returns correct results', () => {
			const get = getServiceFactory({getAuthorization, xhrFactory});
			return get('https://test.com/url').then((result) => {
				expect(result.json()).to.eql({test: 'get resolve'});
			});
		});
		it('does not call xhr.send() if getAuthorization fails', () => {
			xhr.send = sinon.spy();
			getAuthorization = sinon.stub().returns(Promise.reject({test: 'getAuthorization reject'}));
			const get = getServiceFactory({getAuthorization, xhrFactory});
			return get('https://test.com/url').catch((result) => {
				expect(result).to.eql({test: 'getAuthorization reject'});
				expect(xhr.send).not.to.have.been.called;
			});
		});
		it('sets the Authorization and CORS options', () => {
			const get = getServiceFactory({getAuthorization, xhrFactory});
			return get('https://test url').then((result) => {
				expect(xhr.headers).to.eql({
					Authorization: "test jwt",
					'Content-Type': "application/json"
				});
			});
		});
		it('abortLast aborts last get()', (done) => {
			xhr.send = sinon.spy();
			const get = getServiceFactory({getAuthorization, xhrFactory, abortLast: true});
			const catch1 = sinon.spy();
			const catch2 = sinon.spy();
			const promise1 = get('https://test.com/url/1').catch(catch1).then(() => {
				expect(catch1).to.have.been.calledWith('aborted');
			});
			xhr.send = function () {
				this._onload();
			};
			const promise2 = get('https://test.com/url/2').catch(catch2).then(() => {
				expect(catch2).not.to.have.been.called;
			});
			Promise.all([promise1, promise2]).then(() => done());
		});
	});
});
