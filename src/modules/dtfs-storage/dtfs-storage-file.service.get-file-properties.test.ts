import { FileGetPropertiesResponse, RestError } from '@azure/storage-file-share';
import { MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockDtfsStorageClientService } from '@ukef-test/support/mocks/dtfs-storage-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import { DtfsStorageFileService } from './dtfs-storage-file.service';
import { DtfsStorageException } from './exception/dtfs-storage.exception';
import { DtfsStorageAuthenticationFailedException } from './exception/dtfs-storage-authentication-failed.exception';
import { DtfsStorageFileNotFoundException } from './exception/dtfs-storage-file-not-found.exception';

describe('DtfsStorageFileService', () => {
  const valueGenerator = new RandomValueGenerator();
  const fileName = valueGenerator.string();
  const fileLocationPath = valueGenerator.string();
  const expectedFileSize = valueGenerator.integer({ min: 1, max: MAX_FILE_SIZE_BYTES });
  let dtfsStorageFileService: DtfsStorageFileService;

  const mockDtfsStorageClientService = new MockDtfsStorageClientService();

  beforeEach(() => {
    dtfsStorageFileService = new DtfsStorageFileService(mockDtfsStorageClientService);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('getFileProperties', () => {
    it('returns the response when it is returned by the client successfully', async () => {
      mockSuccessfulCompleteDtfsStorageRequest();

      const result = await getProperties();

      expect(result).toEqual({ contentLength: expectedFileSize } as FileGetPropertiesResponse);
    });

    it('throws a DtfsStorageAuthenticationFailedException if the client responds with a 403', async () => {
      mockSuccessfulGetShareFileClientCall();
      const innerError = new RestError('', undefined, 403);
      mockUnsuccessfulGetPropertiesCall(innerError);

      const errorPromise = getProperties();

      await expect(errorPromise).rejects.toBeInstanceOf(DtfsStorageAuthenticationFailedException);
      await expect(errorPromise).rejects.toThrow('Failed to authenticate with the DTFS storage account.');
      await expect(errorPromise).rejects.toHaveProperty('innerError', innerError);
    });

    it('throws a DtfsStorageFileNotFoundException if the client responds with a 404', async () => {
      mockSuccessfulGetShareFileClientCall();
      const innerError = new RestError('', undefined, 404);
      mockUnsuccessfulGetPropertiesCall(innerError);

      const errorPromise = getProperties();

      await expect(errorPromise).rejects.toBeInstanceOf(DtfsStorageFileNotFoundException);
      await expect(errorPromise).rejects.toThrow(`File ${fileLocationPath}/${fileName} was not found in DTFS.`);
      await expect(errorPromise).rejects.toHaveProperty('innerError', innerError);
    });

    it('throws a DtfsStorageException if the client responds with a status code that is NOT 403 OR 404', async () => {
      mockSuccessfulGetShareFileClientCall();
      const message = valueGenerator.string();
      const code = valueGenerator.string();
      const innerError = new RestError(message, code, 401);
      mockUnsuccessfulGetPropertiesCall(innerError);

      const errorPromise = getProperties();

      await expect(errorPromise).rejects.toBeInstanceOf(DtfsStorageException);
      await expect(errorPromise).rejects.toThrow(`Failed to get properties for file ${fileLocationPath}/${fileName}.`);
      await expect(errorPromise).rejects.toHaveProperty('innerError', innerError);
    });
  });

  const mockSuccessfulGetShareFileClientCall = () => mockDtfsStorageClientService.mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath);

  const mockSuccessfulGetPropertiesCall = () => mockDtfsStorageClientService.mockSuccessfulGetPropertiesCall(expectedFileSize);

  const mockSuccessfulCompleteDtfsStorageRequest = () => {
    mockSuccessfulGetShareFileClientCall();
    mockSuccessfulGetPropertiesCall();
  };

  const mockUnsuccessfulGetPropertiesCall = (error: RestError) => mockDtfsStorageClientService.mockUnsuccessfulGetPropertiesCall(error);

  const getProperties = () => dtfsStorageFileService.getFileProperties(fileName, fileLocationPath);
});
