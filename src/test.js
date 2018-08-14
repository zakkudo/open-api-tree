import OpenApiTree from '.';
import ValidationError from './ValidationError';

jest.mock('@zakkudo/fetch');

describe('OpenApiTree', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    it('', () => {
    });
});
