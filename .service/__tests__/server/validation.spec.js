/* eslint-disable no-undef */

import protoLoader from '@grpc/proto-loader';
import path from 'path';
import Validation from '../../server/validation.js';

describe('Proto3 Validation', () => {
  it('If root is null, response is null', () => {
    expect(Validation.load(null)).toEqual(null);
  });

  it('If root is emply object, response will be empty array', () => {
    expect(Validation.load({})).toEqual({});
  });

  it('Load test.proto', () => {
    const { root } = protoLoader.loadSync(`${path.resolve()}/__tests__/interfaces/test.proto`);
    expect(root.AuthService).toEqual(root.AuthService);
  });
});
