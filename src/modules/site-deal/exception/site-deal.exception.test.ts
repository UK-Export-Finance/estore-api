import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SiteDealException } from './site-deal.exception';

describe('SiteDealException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteDealException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteDealException(message);

    expect(exception.name).toBe('SiteDealException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new SiteDealException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of Error', () => {
    expect(new SiteDealException(message)).toBeInstanceOf(Error);
  });
});
