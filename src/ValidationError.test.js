import ValidationError from '@zakkudo/api-tree/ValidationError';
import LocalValidationError from './ValidationError';

describe('ValidationError', () => {
  it('aliases the error', () => {
    expect(ValidationError).toEqual(LocalValidationError);
  });
});

