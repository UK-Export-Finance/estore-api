import { BadRequestException } from '@nestjs/common';
import { DtfsStorageFileNotFoundException } from '@ukef/modules/dtfs-storage/exception/dtfs-storage-file-not-found.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { DtfsStorageExceptionTransformInterceptor } from './dtfs-storage-exception-transform.interceptor';

describe('DtfsStorageExceptionTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  it('converts thrown DtfsStorageFileNotFoundException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const innerError = new Error();
    const dtfsStorageFileNotFoundException = new DtfsStorageFileNotFoundException(message, innerError);
    const interceptor = new DtfsStorageExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => dtfsStorageFileNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Bad request');
    await expect(interceptPromise).rejects.toHaveProperty('cause', dtfsStorageFileNotFoundException);
    await expect(interceptPromise).rejects.toHaveProperty('response.error', message);
  });

  it('does NOT convert thrown exceptions that are NOT DtfsStorageFileNotFoundException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');
    const interceptor = new DtfsStorageExceptionTransformInterceptor();

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
