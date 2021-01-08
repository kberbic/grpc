import grpc from '@grpc/grpc-js';

const { status } = grpc;

export default class ServiceError extends Error {
    code = 2;

    metadata = new grpc.Metadata();

    static GRPC_CODES = status;

    static HTTP_CODES = {
      [status.OK]: 200,
      [status.CANCELLED]: 500,
      [status.UNKNOWN]: 500,
      [status.INVALID_ARGUMENT]: 400,
      [status.DEADLINE_EXCEEDED]: 500,
      [status.NOT_FOUND]: 204,
      [status.ALREADY_EXISTS]: 400,
      [status.PERMISSION_DENIED]: 403,
      [status.RESOURCE_EXHAUSTED]: 429,
      [status.FAILED_PRECONDITION]: 400,
      [status.ABORTED]: 500,
      [status.OUT_OF_RANGE]: 400,
      [status.UNIMPLEMENTED]: 404,
      [status.INTERNAL]: 500,
      [status.UNAVAILABLE]: 404,
      [status.DATA_LOSS]: 500,
      [status.UNAUTHENTICATED]: 401,
    };

    constructor(code, message) {
      super(message || 'SERVICE_ERROR');
      this.code = code;
    }
}
