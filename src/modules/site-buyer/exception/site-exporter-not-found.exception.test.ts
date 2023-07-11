import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SiteBuyerException } from './site-buyer.exception';
import { SiteExporterNotFoundException } from './site-exporter-not-found.exception';

describe('SiteExporterNotFoundException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteExporterNotFoundException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteExporterNotFoundException(message);

    expect(exception.name).toBe('SiteExporterNotFoundException');
  });

  it('exposes the inner error it was created with', () => {
    const innerError = new Error();

    const exception = new SiteExporterNotFoundException(message, innerError);

    expect(exception.innerError).toBe(innerError);
  });

  it('is instance of SiteException', () => {
    expect(new SiteExporterNotFoundException(message)).toBeInstanceOf(SiteBuyerException);
  });
});
