import ServiceError from './service.error.js';

export default class InvalidArgumentsError extends ServiceError {
  constructor(message, fields) {
    super(ServiceError.GRPC_CODES.INVALID_ARGUMENT, message);
    if (fields) {
      this.metadata
        .internalRepr
        .set('fields', [JSON.stringify(fields
          .inner
          .map((field) => ({ [field.path]: field.errors })))]);
    }
  }
}
