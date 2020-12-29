import correlator from "correlation-id";

const _key = "x-correlation-id";
export default (req, next) => {
    if (!req.metadata ||
        !req.metadata.internalRepr ||
        !req.metadata.internalRepr.has(_key) ||
        !req.metadata.internalRepr.get(_key)[0]
    ) {
        correlator.withId(() => {
            req.correlationId = correlator.getId();
            req.metadata.internalRepr.set(_key, [req.correlationId]);
            return next();
        });
    }

    req.correlationId = req.metadata.internalRepr.get(_key)[0];
    next();
}