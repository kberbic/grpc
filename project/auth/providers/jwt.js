import webtoken from 'jsonwebtoken';
import UnauthorizedError from '../errors/unauthorized.error.js';

export default function jwt(publics = []) {
  return (req, next) => {
    if (req.call
            && req.call.handler
            && publics.find((x) => x === req.call.handler.path)) return next();

    if (!req.metadata
            || !req.metadata.internalRepr
            || !req.metadata.internalRepr.has('authorization')
            || !req.metadata.internalRepr.get('authorization')[0]
    ) return next(new UnauthorizedError());

    return webtoken.verify(
      req.metadata.internalRepr.get('authorization')[0],
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) next(new UnauthorizedError());

        req.user = decoded.data;
        next();
      },
    );
  };
}

export function generateToken(user) {
  return webtoken.sign(
    { data: user },
    process.env.JWT_SECRET,
    { expiresIn: (Number(process.env.JWT_EXPIRE_IN) || 60) * 60 },
  );
}
