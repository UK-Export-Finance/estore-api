import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SiteBuyerException } from './site-buyer.exception';

describe('SiteBuyerException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteBuyerException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteBuyerException(message);

    expect(exception.name).toBe('SiteBuyerException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new SiteBuyerException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of Error', () => {
    expect(new SiteBuyerException(message)).toBeInstanceOf(Error);
  });
});
