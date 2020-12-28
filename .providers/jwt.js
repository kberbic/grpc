import webtoken from 'jsonwebtoken';
import IdentityError from '../errors/identity.error.js';

export default function jwt(secret = "", publics = []) {
    return (req, next) => {
        if (req.call &&
            req.call.handler &&
            publics.find(x => x === req.call.handler.path))
            return next();

        if (!req.metadata ||
            !req.metadata.internalRepr ||
            !req.metadata.internalRepr.has("authorization") ||
            !req.metadata.internalRepr.get("authorization")[0]
        )
            return next(new IdentityError('Token invalid'));


        webtoken.verify(
            req.metadata.internalRepr.get("authorization")[0],
            process.env.JWT_SECRET,
            (err, decoded) => {
                if (err) next(new IdentityError('Token invalid'));

                req.user = decoded.data;
                next();
            });
    }
}

export function generateToken(secret, user) {
    return webtoken.sign(
        {data: user},
        secret,
        {expiresIn: (Number(process.env.JWT_EXPIRE_IN) || 60) * 60},
    );
}