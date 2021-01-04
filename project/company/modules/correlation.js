import correlator from 'correlation-id';

const KEY = 'x-correlation-id';
export default (req, next) => {
  if (!req.metadata
        || !req.metadata.internalRepr
        || !req.metadata.internalRepr.has(KEY)
        || !req.metadata.internalRepr.get(KEY)[0]
  ) {
    correlator.withId(() => {
      req.correlationId = correlator.getId();
      req.metadata.internalRepr.set(KEY, [req.correlationId]);
      return next();
    });
  }

  const [correlationId] = req.metadata.internalRepr.get(KEY);
  req.correlationId = correlationId;
  next();
};
