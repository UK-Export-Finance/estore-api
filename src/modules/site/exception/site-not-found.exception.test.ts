import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SiteException } from './site.exception';
import { SiteNotFoundException } from './site-not-found.exception';

describe('SiteNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteNotFoundException(message);

    expect(exception.name).toBe('SiteNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new SiteNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of SiteException', () => {
    expect(new SiteNotFoundException(message)).toBeInstanceOf(SiteException);
  });
});
