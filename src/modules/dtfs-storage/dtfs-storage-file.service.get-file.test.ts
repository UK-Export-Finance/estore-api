import { RestError } from '@azure/storage-file-share';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockDtfsStorageClientService } from '@ukef-test/support/mocks/dtfs-storage-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';
import { Readable } from 'stream';

import { DtfsStorageFileService } from './dtfs-storage-file.service';
import { DtfsStorageException } from './exception/dtfs-storage.exception';
import { DtfsStorageAuthenticationFailedException } from './exception/dtfs-storage-authentication-failed.exception';
import { DtfsStorageFileNotFoundException } from './exception/dtfs-storage-file-not-found.exception';

describe('DtfsStorageFileService', () => {
  const valueGenerator = new RandomValueGenerator();
  const fileName = valueGenerator.string();
  const fileLocationPath = valueGenerator.string();
  const expectedFile = Readable.from([valueGenerator.string()]) as NodeJS.ReadableStream;
  const expectedDownloadResponse = {
    readableStreamBody: expectedFile,
    _response: null,
  };
  let dtfsStorageFileService: DtfsStorageFileService;

  const mockDtfsStorageClientService = new MockDtfsStorageClientService();

  beforeEach(() => {
    dtfsStorageFileService = new DtfsStorageFileService(mockDtfsStorageClientService);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('getFile', () => {
    it('returns the file when it is returned by the client successfully', async () => {
      mockSuccessfulCompleteDtfsStorageRequest();

      const result = await getFile();

      expect(result).toEqual(expectedFile);
    });

    it('throws a DtfsStorageAuthenticationFailedException if the client responds with a 403', async () => {
      mockSuccessfulGetShareFileClientCall();
      const innerError = new RestError('', {
        statusCode: 403,
      });
      mockUnsuccessfulDownloadCall(innerError);

      const errorPromise = getFile();

      await expect(errorPromise).rejects.toBeInstanceOf(DtfsStorageAuthenticationFailedException);
      await expect(errorPromise).rejects.toThrow('Failed to authenticate with the DTFS storage account.');
      await expect(errorPromise).rejects.toHaveProperty('innerError', innerError);
    });

    it('throws a DtfsStorageFileNotFoundException if the client responds with a 404', async () => {
      mockSuccessfulGetShareFileClientCall();
      const innerError = new RestError('', {
        statusCode: 404,
      });
      mockUnsuccessfulDownloadCall(innerError);

      const errorPromise = getFile();

      await expect(errorPromise).rejects.toBeInstanceOf(DtfsStorageFileNotFoundException);
      await expect(errorPromise).rejects.toThrow(`File ${fileLocationPath}/${fileName} was not found in DTFS.`);
      await expect(errorPromise).rejects.toHaveProperty('innerError', innerError);
    });

    it('throws a DtfsStorageException if the client responds with a status code that is NOT 403 OR 404', async () => {
      mockSuccessfulGetShareFileClientCall();
      const message = valueGenerator.string();
      const code = valueGenerator.string();
      const innerError = new RestError(message, {
        code,
        statusCode: 401,
      });
      mockUnsuccessfulDownloadCall(innerError);

      const errorPromise = getFile();

      await expect(errorPromise).rejects.toBeInstanceOf(DtfsStorageException);
      await expect(errorPromise).rejects.toThrow(`Failed to get file ${fileLocationPath}/${fileName}.`);
      await expect(errorPromise).rejects.toHaveProperty('innerError', innerError);
    });
  });

  const mockSuccessfulGetShareFileClientCall = () => mockDtfsStorageClientService.mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath);

  const mockSuccessfulDownloadCall = () => mockDtfsStorageClientService.mockSuccessfulDownloadCall(expectedDownloadResponse);

  const mockSuccessfulCompleteDtfsStorageRequest = () => {
    mockSuccessfulGetShareFileClientCall();
    mockSuccessfulDownloadCall();
  };

  const mockUnsuccessfulDownloadCall = (error: RestError) => mockDtfsStorageClientService.mockUnsuccessfulDownloadCall(error);

  const getFile = () => dtfsStorageFileService.getFile(fileName, fileLocationPath);
});
