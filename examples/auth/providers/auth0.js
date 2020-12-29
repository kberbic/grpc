import jwksRsa from 'jwks-rsa';
import jwtExpress from 'express-jwt';
import UnauthorizedError from '../errors/unauthorized.error.js';

export default function Auth0(domain, audience, publics = []) {
  const options = {
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${domain}/.well-known/jwks.json`,
    }),
    audience,
    issuer: `https://${domain}/`,
    algorithms: ['RS256'],
    getToken: (req) => {
      if (!req.metadata
                || !req.metadata.internalRepr
                || !req.metadata.internalRepr.has('authorization')
                || !req.metadata.internalRepr.get('authorization')[0]
      ) throw new UnauthorizedError();

      return req.metadata.internalRepr.get('authorization')[0];
    },
  };

  return (req, next) => {
    if (req.call
            && req.call.handler
            && publics.find((x) => x === req.call.handler.path)) return next();

    return jwtExpress(options)(req, null, async (err) => {
      if (err) {
        return next(err);
      }

      const { user } = req;
      if (!user) {
        return next(new UnauthorizedError());
      }

      req.user = { id: user.sub };
      return next();
    });
  };
}
