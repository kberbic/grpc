import ServiceError from '../server/service.error.js';

export default class UnauthenticatedError extends ServiceError {
  constructor(message) {
    super(ServiceError.GRPC_CODES.UNAUTHENTICATED, message);
  }
}
