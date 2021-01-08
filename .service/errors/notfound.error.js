import ServiceError from '../server/service.error.js';

export default class NotFoundError extends ServiceError {
  constructor(message) {
    super(ServiceError.GRPC_CODES.NOT_FOUND, message);
  }
}
