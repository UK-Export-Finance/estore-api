import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DtfsStorageException } from './dtfs-storage.exception';
import { DtfsStorageFileNotFoundException } from './dtfs-storage-file-not-found.exception';

describe('DtfsStorageFileNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new DtfsStorageFileNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new DtfsStorageFileNotFoundException(message);

    expect(exception.name).toBe('DtfsStorageFileNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new DtfsStorageFileNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of DtfsStorageException', () => {
    expect(new DtfsStorageFileNotFoundException(message)).toBeInstanceOf(DtfsStorageException);
  });
});
