/* no-undef */

import Validation from '../../server/validation.js';

describe('Proto3 Validation', () => {
    it('If root is null, response is null', () => {
        expect(Validation.load(null)).toEqual(null);
    });

    it('If root is emply object, response will be empty array', () => {
        expect(Validation.load({})).toEqual({});
    });
});