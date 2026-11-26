import { ShareFileClient } from '@azure/storage-file-share';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks } from 'jest-when';

import { DtfsStorageClientService } from './dtfs-storage-client.service';

describe('DtfsStorageClientService', () => {
  const valueGenerator = new RandomValueGenerator();
  const baseUrl = valueGenerator.httpsUrl();
  const accountName = valueGenerator.word();
  const accountKey = valueGenerator.string();
  const dealDocumentsFolderPath = valueGenerator.string();
  const fileLocationPath = valueGenerator.fileLocationPath();
  const fileName = valueGenerator.fileName();

  let dtfsStorageClientService;

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
    dtfsStorageClientService = new DtfsStorageClientService({ baseUrl, accountName, accountKey, dealDocumentsFolderPath });
  });

  describe('constructor', () => {
    it(`successfully creates a DtfsStorageClientService instance`, () => {
      expect(dtfsStorageClientService).toBeDefined();
      expect(dtfsStorageClientService.storageSharedKeyCredential).toBeDefined();
    });
  });

  describe('getShareFileClient', () => {
    it('returns a new ShareFileClient instance', () => {
      const result = dtfsStorageClientService.getShareFileClient(fileName, fileLocationPath);

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ShareFileClient);
    });
  });
});
