import _      from 'lodash';
import jwt    from 'jsonwebtoken';
import logger from 'winston';

import {
    UnauthenticatedError
} from '@revolttv/errors';

function getToken(req) {
    if (_.get(req, 'headers.authorization', '').split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (_.get(req, 'query.token', '')) {
        return req.query.token;
    }

    return null;
}

export default (options = {}) => {
    const secret = options.secret || '';

    return (req, res, next) => {
        let token = getToken(req);
        if (!token) {
            return next(new UnauthenticatedError());
        }

        if (_.get(req, 'query.token')) {
            delete req.query.token;
        }

        try {
            let decoded = jwt.verify(token, secret);
            logger.debug('decoded jwt', decoded);
            req.user = decoded;

            return next();
        } catch (err) {
            logger.debug('jwt invalid', err);
            return next(new UnauthenticatedError());
        }
    };
};
