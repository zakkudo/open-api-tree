import OpenApiTree from '.';
import fetch from '@zakkudo/fetch';
import api from './api';

jest.mock('@zakkudo/fetch');

describe('OpenApiTree', () => {
    beforeEach(() => {
        fetch.mockReset();
        fetch.mockReturnValue(Promise.resolve('test response'));
    });

    it('', () => {
    });
});
