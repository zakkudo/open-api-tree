import UrlError from '@zakkudo/url/UrlError';
import LocalUrlError from './UrlError';

describe('UrlError', () => {
  it('aliases the error', () => {
    expect(UrlError).toEqual(LocalUrlError);
  });
});

