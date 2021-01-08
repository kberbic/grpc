/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

import path from 'path';
import GRPCClient from '../../server/client.js';

describe('GRPC client', () => {
  it('If client is loaded, response contain TestService', () => {
    const client = new GRPCClient([{
      interfaces: `${path.resolve()}/__tests__/interfaces`,
      address: '0.0.0.0:8080',
      proto: 'test.proto',
    }]);

    expect(client).toHaveProperty('TestService');
  });
});
