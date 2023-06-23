import { FileGetPropertiesResponse } from '@azure/storage-file-share';
import { MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockDtfsStorageClientService } from '@ukef-test/support/mocks/dtfs-storage-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import { DtfsStorageFileService } from './dtfs-storage-file.service';

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
      mockDtfsStorageClientService.mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath);
      mockDtfsStorageClientService.mockSuccessfulGetPropertiesCall(expectedFileSize);

      const result = await dtfsStorageFileService.getFileProperties(fileName, fileLocationPath);

      expect(result).toEqual({ contentLength: expectedFileSize } as FileGetPropertiesResponse);
    });
  });
});
