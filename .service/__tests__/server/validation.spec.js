/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

import protoLoader from '@grpc/proto-loader';
import path from 'path';
import Validation from '../../server/validation.js';

const { root } = protoLoader.loadSync(`${path.resolve()}/__tests__/interfaces/test.proto`);

describe('Proto3 Validation', () => {
  it('If root is null, response is null', () => {
    expect(Validation.load(null)).toEqual(null);
  });

  it('If root is emply object, response is empty object', () => {
    expect(Validation.load({})).toEqual({});
  });

  it('If load test.proto, response containe two JSON schemas', () => {
    const schemas = Validation.load(root);
    expect(schemas).toHaveProperty('Token');
    expect(schemas).toHaveProperty('Login');
  });

  it('If load test.proto, Login JSON schema have two fields (username, password)', () => {
    const schemas = Validation.load(root);
    expect(schemas).toHaveProperty('Login');
    expect(schemas.Login).toHaveProperty('fields');
    expect(schemas.Login.fields).toHaveProperty('username');
    expect(schemas.Login.fields).toHaveProperty('password');
  });

  it('If load test.proto, Login JSON schema props are required', () => {
    const schemas = Validation.load(root);
    expect(schemas).toHaveProperty('Login');
    expect(schemas.Login).toHaveProperty('fields');

    expect(schemas.Login.fields).toHaveProperty('username');
    expect(schemas.Login.fields.username).toHaveProperty('_exclusive');
    expect(schemas.Login.fields.username._exclusive).toHaveProperty('required');
    expect(schemas.Login.fields.username._exclusive).toHaveProperty('min');
    expect(schemas.Login.fields.username._exclusive).toHaveProperty('matches');
    expect(schemas.Login.fields.username._exclusive).toHaveProperty('email');

    expect(schemas.Login.fields).toHaveProperty('password');
    expect(schemas.Login.fields.password).toHaveProperty('_exclusive');
    expect(schemas.Login.fields.password._exclusive).toHaveProperty('required');
    expect(schemas.Login.fields.password._exclusive).toHaveProperty('max');
  });
});
