import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { SiteExporterInvalidException } from './site-exporter-invalid.exception';

describe('SiteExporterInvalidException', () => {
  const valueGenerator = new RandomValueGenerator();
  const message = valueGenerator.string();

  it('exposes the message it was created with', () => {
    const exception = new SiteExporterInvalidException(message);

    expect(exception.message).toBe(message);
  });

  it('exposes the name of the exception', () => {
    const exception = new SiteExporterInvalidException(message);

    expect(exception.name).toBe('SiteExporterInvalidException');
  });

  it('is instance of Error', () => {
    expect(new SiteExporterInvalidException(message)).toBeInstanceOf(Error);
  });
});
