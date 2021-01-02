/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

import protoLoader from '@grpc/proto-loader';
import path from 'path';
import Routes from '../../server/routes.js';

const { root } = protoLoader.loadSync(`${path.resolve()}/__tests__/interfaces/test.proto`);

const ROUTES = [
  {
    service: 'TestService',
    method: 'token',
    path: '/AuthService/token',
    type: 'post',
    map: ['query', 'params', 'body'],
    proto: 'test.proto',
    address: '0.0.0.0:8080',
  },
  {
    service: 'TestService',
    method: 'getUser',
    path: '/AuthService/me',
    type: 'get',
    map: ['query', 'params'],
    proto: 'test.proto',
    address: '0.0.0.0:8080',
  },
];

describe('Proto3 Routes', () => {
  it('If root is null, response is null', () => {
    expect(Routes.load()).toEqual([]);
  });

  it('If root is emply object, response is empty object', () => {
    expect(Routes.load({})).toEqual([]);
  });

  it('If load test.proto, response is array of routes', () => {
    const routes = Routes.load(root, 'test.proto', '0.0.0.0:8080');
    expect(routes).toHaveLength(2);
    expect(routes).toEqual(ROUTES);
  });
});
