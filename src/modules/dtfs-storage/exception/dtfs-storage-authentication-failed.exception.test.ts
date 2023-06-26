import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DtfsStorageException } from './dtfs-storage.exception';
import { DtfsStorageAuthenticationFailedException } from './dtfs-storage-authentication-failed.exception';

describe('DtfsStorageAuthenticationFailedException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new DtfsStorageAuthenticationFailedException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new DtfsStorageAuthenticationFailedException(message);

    expect(exception.name).toBe('DtfsStorageAuthenticationFailedException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new DtfsStorageAuthenticationFailedException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of DtfsStorageException', () => {
    expect(new DtfsStorageAuthenticationFailedException(message)).toBeInstanceOf(DtfsStorageException);
  });
});
