import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { EnumConversionException } from './enum-conversion.exception';

describe('EnumConversionException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new EnumConversionException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new EnumConversionException(message);

    expect(exception.name).toBe('EnumConversionException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new EnumConversionException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of Error', () => {
    expect(new EnumConversionException(message)).toBeInstanceOf(Error);
  });
});
