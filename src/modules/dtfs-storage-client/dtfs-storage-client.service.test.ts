import { ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks } from 'jest-when';

import DtfsStorageClientService from './dtfs-storage-client.service';
jest.mock('@azure/storage-file-share');

describe('DtfsStorageClientService', () => {
  const valueGenerator = new RandomValueGenerator();
  const baseUrl = valueGenerator.httpsUrl();
  const accountName = valueGenerator.word();
  const accountKey = valueGenerator.string();
  const dealDocumentsFolderPath = valueGenerator.string();
  const fileLocationPath = valueGenerator.fileLocationPath();
  const fileName = valueGenerator.fileName();
  const urlForShareFileClient = `${baseUrl}/${dealDocumentsFolderPath}/${fileLocationPath}/${fileName}`;

  let dtfsStorageClientService;

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
    dtfsStorageClientService = new DtfsStorageClientService({ baseUrl, accountName, accountKey, dealDocumentsFolderPath });
  });

  describe('constructor', () => {
    it(`sets the 'storageSharedKeyCredential' property to a new StorageSharedKeyCredential created with the accountName and accountKey`, () => {
      expect(StorageSharedKeyCredential).toHaveBeenCalledTimes(1);
      expect(StorageSharedKeyCredential).toHaveBeenCalledWith(accountName, accountKey);
      expect(dtfsStorageClientService.storageSharedKeyCredential).toBeInstanceOf(StorageSharedKeyCredential);
    });
  });

  describe('getShareFileClient', () => {
    it('returns a new ShareFileClient created with the StorageSharedKeyCredential', () => {
      const result = dtfsStorageClientService.getShareFileClient(fileName, fileLocationPath);

      expect(ShareFileClient).toHaveBeenCalledTimes(1);
      expect(ShareFileClient).toHaveBeenCalledWith(urlForShareFileClient, dtfsStorageClientService.storageSharedKeyCredential);
      expect(result).toBeInstanceOf(ShareFileClient);
    });
  });
});
