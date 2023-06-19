import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { DtfsException } from './dtfs.exception';

describe('DtfsException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new DtfsException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new DtfsException(message);

    expect(exception.name).toBe('DtfsException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new DtfsException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });
});
