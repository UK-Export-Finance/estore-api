import { BadRequestException } from '@nestjs/common';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { DtfsExceptionTransformInterceptor } from './dtfs-exception-transform.interceptor';
import { DtfsFileNotFoundException } from './exception/dtfs-file-not-found.exception';

describe('DtfsExceptionTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  it('converts thrown DtfsFileNotFoundException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const innerError = new Error();
    const dtfsFileNotFoundException = new DtfsFileNotFoundException(message, innerError);
    const interceptor = new DtfsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => dtfsFileNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Bad request');
    await expect(interceptPromise).rejects.toHaveProperty('cause', dtfsFileNotFoundException);
    await expect(interceptPromise).rejects.toHaveProperty('response.error', message);
  });

  it('does NOT convert thrown exceptions that are NOT DtfsFileNotFoundException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');
    const interceptor = new DtfsExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
