import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DtfsException } from './dtfs.exception';
import { DtfsFileNotFoundException } from './dtfs-file-not-found.exception';

describe('DtfsFileNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new DtfsFileNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new DtfsFileNotFoundException(message);

    expect(exception.name).toBe('DtfsFileNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new DtfsFileNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of DtfsException', () => {
    expect(new DtfsFileNotFoundException(message)).toBeInstanceOf(DtfsException);
  });
});
