/*global describe, it, beforeEach*/

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import {deleteServiceFactory} from '../src'

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

describe('deleteServiceFactory', () => {
	let fetch, getAuthorization;
	beforeEach(() => {
		fetch = sinon.stub().returns(Promise.resolve({test: 'fetch resolve'}));
		getAuthorization = sinon.stub().returns(Promise.resolve({jwt: 'test jwt'}));
	});
	it('exits', () => {
		expect(deleteServiceFactory).to.be.a('function');
	});
	it('throws missing fetch function', () => {
		expect(deleteServiceFactory.bind(null, {})).to.throw('required "fetch" parameter must be a function');
	});
	it('throws missing getAuthorization function', () => {
		expect(deleteServiceFactory.bind(null, {fetch})).to.throw('required "getAuthorization" parameter must be a function');
	});
	describe('doDelete(url, body, headers)', () => {
		it('returns deleteService results', () => {
			const deleteService = deleteServiceFactory({fetch, getAuthorization});
			return deleteService('https://test.com/url').then((result) => {
				expect(result).to.eql({test: 'fetch resolve'});
			});
		});
		it('does not call fetch if getAuthorization fails', () => {
			getAuthorization = sinon.stub().returns(Promise.reject({test: 'getAuthorization reject'}));
			const deleteService = deleteServiceFactory({fetch, getAuthorization});
			return deleteService('https://test.com/url').catch((result) => {
				expect(result).to.eql({test: 'getAuthorization reject'});
				expect(fetch).not.to.have.been.called;
			});
		});
		it('sets the Authorization and CORS options', () => {
			const deleteService = deleteServiceFactory({fetch, getAuthorization});
			return deleteService('https://test url').then((result) => {
				expect(fetch).to.have.been.calledWith('https://test url', {
					body: undefined,
					headers: {
						Authorization: "test jwt",
						'Content-Type': "application/json"
					},
					method: "DELETE",
					mode: "cors"
				});
			});
		});
	});
});
