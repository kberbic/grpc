/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

import path from 'path';
import GRPCClient from '../../clients/grpc.js';

describe('GRPC client', () => {
  it('If client is loaded, response contain TestService', () => {
    const client = new GRPCClient([{
      interfaces: `${path.resolve()}/__tests__`,
      address: '0.0.0.0:8080',
      proto: '/interfaces/test.proto',
    }]);

    expect(client).toHaveProperty('TestService');
  });
});
