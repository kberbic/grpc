import ServiceError from './service.error.js';

export default class InvalidArgumentsError extends ServiceError {
    fields = {};

    constructor(message, fields) {
      super(ServiceError.GRPC_CODES.INVALID_ARGUMENT, message);
      this.fields = fields;
    }
}
