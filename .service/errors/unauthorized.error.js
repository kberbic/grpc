import ServiceError from './service.error.js';

export default class UnauthorizedError extends ServiceError {
  constructor(message) {
    super(ServiceError.GRPC_CODES.PERMISSION_DENIED, message);
  }
}
