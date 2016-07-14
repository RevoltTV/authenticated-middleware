import chai, { expect } from 'chai';
import jwt              from 'jsonwebtoken';
import sinon            from 'sinon';
import sinonChai        from 'sinon-chai';

import * as Errors from '@revolttv/errors';

import authenticatedMiddleware  from '../src';

chai.use(sinonChai);

describe('authenticated-middleware', () => {
    let secret = 'secret';
    let token = jwt.sign({ username: 'test' }, secret);
    let middleware;

    beforeEach(() => {
        middleware = authenticatedMiddleware({
            secret
        });
    });

    it('should call next() with UnauthenticatedError if no authorization header is present', () => {
        let req = {
            headers: {},
            query: null
        };

        let res = {};

        let next = sinon.spy();

        middleware(req, res, next);

        expect(next).to.have.been.calledOnce;
        let arg = next.firstCall.args[0];
        expect(arg).to.be.an.instanceof(Errors.UnauthenticatedError);
    });

    it('should call next() with UnauthenticatedError if invalid authorization header', () => {
        let req = { headers: { authorization: 'invalid token' } };

        let res = {};

        let next = sinon.spy();

        middleware(req, res, next);

        req.headers.authorization = 'Bearer invalidtokentest';

        middleware(req, res, next);

        expect(next).to.have.been.calledTwice;
        let arg = next.firstCall.args[0];
        expect(arg).to.be.an.instanceof(Errors.UnauthenticatedError);
        arg = next.secondCall.args[0];
        expect(arg).to.be.an.instanceof(Errors.UnauthenticatedError);
    });

    it('should continue to next on valid JWT', () => {
        let req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        let res = {
            json: sinon.stub().returnsThis(),
            status: sinon.stub().returnsThis()
        };

        let next = sinon.spy();

        middleware(req, res, next);

        expect(next).to.have.been.called;
        expect(req.user).to.exist;
        expect(req.user.username).to.equal('test');
        expect(res.status).to.not.have.been.called;
        expect(res.json).to.not.have.been.called;
    });

    it('should allow token in query string', () => {
        let req = {
            query: {
                token
            }
        };

        let res = {
            json: sinon.stub().returnsThis(),
            status: sinon.stub().returnsThis()
        };

        let next = sinon.spy();

        middleware(req, res, next);

        expect(next).to.have.been.called;

        expect(req.user).to.exist;
        expect(req.user.username).to.equal('test');

        expect(res.status).to.not.have.been.called;
        expect(res.json).to.not.have.been.called;
    });
});
