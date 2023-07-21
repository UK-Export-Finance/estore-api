import { BadRequestException } from '@nestjs/common';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { SiteExporterInvalidException } from '../exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from '../exception/site-exporter-not-found.exception';
import { SiteExporterExceptionTransformInterceptor } from './site-exporter-exception-transform.interceptor';

describe('SiteExporterExceptionTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  let interceptor: SiteExporterExceptionTransformInterceptor;

  beforeEach(() => {
    interceptor = new SiteExporterExceptionTransformInterceptor();
  });

  it('converts thrown SiteExporterNotFoundException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const innerError = new Error();
    const siteExporterNotFoundException = new SiteExporterNotFoundException(message, innerError);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => siteExporterNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', message);
    await expect(interceptPromise).rejects.toHaveProperty('cause', siteExporterNotFoundException);
  });

  it('converts thrown SiteExporterInvalidException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const siteExporterInvalidException = new SiteExporterInvalidException(message);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => siteExporterInvalidException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', message);
    await expect(interceptPromise).rejects.toHaveProperty('cause', siteExporterInvalidException);
  });

  it('does NOT convert thrown exceptions that are NOT SiteExporterNotFoundException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
