import { BadRequestException } from '@nestjs/common';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { lastValueFrom, throwError } from 'rxjs';

import { UploadFileInDealFolderExistsException } from '../exception/upload-file-in-deal-folder-exists.exception';
import { UploadFileInDealFolderSiteNotFoundException } from '../exception/upload-file-in-deal-folder-site-not-found.exception';
import { DealFolderExceptionTransformInterceptor } from './deal-folder-exception-transform.interceptor';

describe('DealFolderExceptionTransformInterceptor', () => {
  const valueGenerator = new RandomValueGenerator();

  let interceptor: DealFolderExceptionTransformInterceptor;

  beforeEach(() => {
    interceptor = new DealFolderExceptionTransformInterceptor();
  });

  it('converts thrown UploadFileInDealFolderExistsException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const innerError = new Error();
    const uploadFileInDealFolderExistsException = new UploadFileInDealFolderExistsException(message, innerError);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => uploadFileInDealFolderExistsException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Bad request');
    await expect(interceptPromise).rejects.toHaveProperty('cause', uploadFileInDealFolderExistsException);
    await expect(interceptPromise).rejects.toHaveProperty('response.error', message);
  });

  it('converts thrown UploadFileInDealFolderSiteNotFoundException to BadRequestException', async () => {
    const message = valueGenerator.string();
    const uploadFileInDealFolderSiteNotFoundException = new UploadFileInDealFolderSiteNotFoundException(message);

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => uploadFileInDealFolderSiteNotFoundException) }));

    await expect(interceptPromise).rejects.toBeInstanceOf(BadRequestException);
    await expect(interceptPromise).rejects.toHaveProperty('message', 'Bad request');
    await expect(interceptPromise).rejects.toHaveProperty('cause', uploadFileInDealFolderSiteNotFoundException);
    await expect(interceptPromise).rejects.toHaveProperty('response.error', message);
  });

  it('does NOT convert thrown exceptions that are NOT UploadFileInDealFolderExistsException or UploadFileInDealFolderSiteNotFoundException', async () => {
    const exceptionThatShouldNotBeTransformed = new Error('Test exception');

    const interceptPromise = lastValueFrom(interceptor.intercept(null, { handle: () => throwError(() => exceptionThatShouldNotBeTransformed) }));

    await expect(interceptPromise).rejects.toThrow(exceptionThatShouldNotBeTransformed);
  });
});
