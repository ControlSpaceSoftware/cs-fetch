/*global describe, it, beforeEach*/

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import {postServiceFactory} from '../src'

chai.should();
chai.use(sinonChai);

const expect = chai.expect;

describe('postServiceFactory', () => {
	let fetch, getAuthorization;
	beforeEach(() => {
		fetch = sinon.stub().returns(Promise.resolve({test: 'fetch resolve'}));
		getAuthorization = sinon.stub().returns(Promise.resolve({jwt: 'test jwt'}));
	});
	it('exits', () => {
		expect(postServiceFactory).to.be.a('function');
	});
	it('throws missing fetch function', () => {
		expect(postServiceFactory.bind(null, {})).to.throw('required "fetch" parameter must be a function');
	});
	it('throws missing getAuthorization function', () => {
		expect(postServiceFactory.bind(null, {fetch})).to.throw('required "getAuthorization" parameter must be a function');
	});
	describe('post(url, body, headers)', () => {
		it('returns post results', () => {
			const post = postServiceFactory({fetch, getAuthorization});
			return post('https://test.com/url').then((result) => {
				expect(result).to.eql({test: 'fetch resolve'});
			});
		});
		it('does not call fetch if getAuthorization fails', () => {
			getAuthorization = sinon.stub().returns(Promise.reject({test: 'getAuthorization reject'}));
			const post = postServiceFactory({fetch, getAuthorization});
			return post('https://test.com/url').catch((result) => {
				expect(result).to.eql({test: 'getAuthorization reject'});
				expect(fetch).not.to.have.been.called;
			});
		});
		it('sets the Authorization and CORS options', () => {
			const post = postServiceFactory({fetch, getAuthorization});
			return post('https://test url').then((result) => {
				expect(fetch).to.have.been.calledWith('https://test url', {
					body: undefined,
					headers: {
						Authorization: "test jwt",
						'Content-Type': "application/json"
					},
					method: "POST",
					mode: "cors"
				});
			});
		});
	});
});
