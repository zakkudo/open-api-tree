import HttpError from '@zakkudo/fetch/HttpError';
import LocalHttpError from './HttpError';

describe('HttpError', () => {
  it('aliases the error', () => {
    expect(HttpError).toEqual(LocalHttpError);
  });
});

