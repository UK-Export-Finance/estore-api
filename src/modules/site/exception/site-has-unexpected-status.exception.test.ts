import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { SiteHasUnexpectedStatusException } from './site-has-unexpected-status.exception';

import { SiteException } from './site.exception';

describe('SiteHasUnexpectedStatusException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteHasUnexpectedStatusException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteHasUnexpectedStatusException(message);

    expect(exception.name).toBe('SiteHasUnexpectedStatusException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new SiteHasUnexpectedStatusException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of SiteException', () => {
    expect(new SiteHasUnexpectedStatusException(message)).toBeInstanceOf(SiteException);
  });
});
