import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SiteDealException } from './site-deal.exception';
import { SiteDealFolderNotFoundException } from './site-deal-folder-not-found.exception';

describe('SiteDealFolderNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteDealFolderNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteDealFolderNotFoundException(message);

    expect(exception.name).toBe('SiteDealFolderNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new SiteDealFolderNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of SiteException', () => {
    expect(new SiteDealFolderNotFoundException(message)).toBeInstanceOf(SiteDealException);
  });
});
