import QueryStringError from '@zakkudo/query-string/QueryStringError';
import LocalQueryStringError from './QueryStringError';

describe('QueryStringError', () => {
    it('aliases the error', () => {
        expect(QueryStringError).toEqual(LocalQueryStringError);
    });
});

