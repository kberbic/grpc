/* eslint-disable no-undef */

import correlation from '../../modules/correlation.js';

describe('Correlation', () => {
  it('If missing arguments, throw error', () => {
    expect(() => { correlation(); }).toThrow();
  });

  it('If missing next argument, throw error', () => {
    const req = {};
    expect(() => { correlation(req); }).toThrow();
  });

  it('If pass args, response is correlation id on request object', (done) => {
    const req = {
      metadata: {
        internalRepr: new Map(),
      },
    };
    correlation(req, () => {
      expect(req).toHaveProperty('correlationId');
      expect(req).toHaveProperty('metadata');
      expect(req.metadata).toHaveProperty('internalRepr');
      expect(req.correlationId).toBeDefined();
      expect(req.metadata.internalRepr.get('x-correlation-id'))
        .toEqual([req.correlationId]);
      done();
    });
  });

  it('If pass correlation id, response is same correlation id', (done) => {
    const req = {
      metadata: {
        internalRepr: new Map(),
      },
    };
    req.metadata.internalRepr.set('x-correlation-id', ['177aee15-1365-4cf8-ab3d-d3b81ea0e20b']);

    correlation(req, () => {
      expect(req).toHaveProperty('correlationId');
      expect(req).toHaveProperty('metadata');
      expect(req.metadata).toHaveProperty('internalRepr');
      expect(req.correlationId).toBeDefined();
      expect(req.metadata.internalRepr.get('x-correlation-id'))
        .toEqual(['177aee15-1365-4cf8-ab3d-d3b81ea0e20b']);
      done();
    });
  });
});
