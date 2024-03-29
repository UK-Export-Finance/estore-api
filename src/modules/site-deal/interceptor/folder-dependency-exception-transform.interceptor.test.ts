import { BadRequestException } from '@nestjs/common';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { FolderDependencyInvalidException } from '../exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from '../exception/folder-dependency-not-found.exception';
import { FolderDependencyExceptionTransformInterceptor } from './folder-dependency-exception-transform.interceptor';

describe('FolderDependencyExceptionTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  let interceptor: FolderDependencyExceptionTransformInterceptor;

  beforeEach(() => {
    interceptor = new FolderDependencyExceptionTransformInterceptor();
  });

  it('converts thrown FolderDependencyNotFoundException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const innerError = new Error();
    const folderDependencyNotFoundException = new FolderDependencyNotFoundException(message, innerError);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => folderDependencyNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', message);
    await expect(interceptPromise).rejects.toHaveProperty('cause', folderDependencyNotFoundException);
  });

  it('converts thrown FolderDependencyInvalidException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const folderDependencyInvalidException = new FolderDependencyInvalidException(message);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => folderDependencyInvalidException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', message);
    await expect(interceptPromise).rejects.toHaveProperty('cause', folderDependencyInvalidException);
  });

  it('does NOT convert thrown exceptions that are NOT FolderDependencyNotFoundException or FolderDependencyInvalidException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
