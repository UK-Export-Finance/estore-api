import { BadRequestException } from '@nestjs/common';
import { SiteDealFolderNotFoundException } from '@ukef/modules/site-deal/exception/site-deal-folder-not-found.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { SiteDealNotFoundExceptionToBadRequestTransformInterceptor } from './site-deal-not-found-exception-to-bad-request-transform.interceptor';

describe('SiteDealNotFoundExceptionToBadRequestTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  let interceptor: SiteDealNotFoundExceptionToBadRequestTransformInterceptor;

  beforeEach(() => {
    interceptor = new SiteDealNotFoundExceptionToBadRequestTransformInterceptor();
  });

  it('converts thrown SiteDealFolderNotFoundException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const innerError = new Error();
    const siteDealFolderNotFoundException = new SiteDealFolderNotFoundException(message, innerError);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => siteDealFolderNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', message);
    await expect(interceptPromise).rejects.toHaveProperty('cause', siteDealFolderNotFoundException);
  });

  it('does NOT convert thrown exceptions that are NOT SiteDealFolderNotFoundException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
