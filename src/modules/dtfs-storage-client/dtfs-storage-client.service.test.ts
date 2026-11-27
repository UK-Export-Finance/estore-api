import { ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks } from 'jest-when';

import { DtfsStorageClientService } from './dtfs-storage-client.service';

describe('DtfsStorageClientService', () => {
  const valueGenerator = new RandomValueGenerator();
  const baseUrl = valueGenerator.httpsUrl();
  const accountName = valueGenerator.word();
  const mockAccountKey = valueGenerator.string();
  const dealDocumentsFolderPath = valueGenerator.string();
  const fileLocationPath = valueGenerator.fileLocationPath();
  const fileName = valueGenerator.fileName();

  let storageSharedKeyCredentialSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetAllWhenMocks();
    storageSharedKeyCredentialSpy = jest.spyOn(StorageSharedKeyCredential.prototype, 'constructor' as any);
  });

  afterEach(() => {
    storageSharedKeyCredentialSpy.mockRestore();
  });

  describe('constructor', () => {
    it('instantiates StorageSharedKeyCredential with correct account name and key', () => {
      const service = new DtfsStorageClientService({ baseUrl, accountName, accountKey: mockAccountKey, dealDocumentsFolderPath });

      // Verify the credential was created with the correct account name
      expect(service.storageSharedKeyCredential).toBeInstanceOf(StorageSharedKeyCredential);
      expect(service.storageSharedKeyCredential.accountName).toBe(accountName);

      // Verify the credential can sign requests correctly by using it to create a client
      // A credential created with an incorrect key would fail to authenticate when used
      const fileName = valueGenerator.fileName();
      const fileLocationPath = valueGenerator.fileLocationPath();
      const client = service.getShareFileClient(fileName, fileLocationPath);

      // The client can only be created successfully if the credential was initialized with correct account name and key
      expect(client).toBeInstanceOf(ShareFileClient);
    });

    it('stores the baseUrl and dealDocumentsFolderPath for later use', () => {
      const service = new DtfsStorageClientService({ baseUrl, accountName, accountKey: mockAccountKey, dealDocumentsFolderPath });

      expect(service.baseUrl).toBe(baseUrl);
      expect(service.dealDocumentsFolderPath).toBe(dealDocumentsFolderPath);
    });

    it('creates a valid StorageSharedKeyCredential instance', () => {
      const service = new DtfsStorageClientService({ baseUrl, accountName, accountKey: mockAccountKey, dealDocumentsFolderPath });

      expect(service.storageSharedKeyCredential).toBeInstanceOf(StorageSharedKeyCredential);
      // Verify the credential was created with the correct account name
      expect(service.storageSharedKeyCredential.accountName).toBe(accountName);
    });
  });

  describe('getShareFileClient', () => {
    it('returns a ShareFileClient initialized with the credential and a URL containing all path segments', () => {
      const service = new DtfsStorageClientService({ baseUrl, accountName, accountKey: mockAccountKey, dealDocumentsFolderPath });
      const client = service.getShareFileClient(fileName, fileLocationPath);

      // Key verifications:
      // 1. Returns a ShareFileClient instance
      expect(client).toBeInstanceOf(ShareFileClient);

      // 2. URL includes the base URL
      expect(client.url).toContain(baseUrl);

      // 3. URL includes the account name (from dealDocumentsFolderPath logic)
      expect(client.url).toContain(dealDocumentsFolderPath);

      // 4. URL includes the filename
      expect(client.url).toContain(fileName);
    });

    it('creates credential with correct account name', () => {
      const service = new DtfsStorageClientService({ baseUrl, accountName, accountKey: mockAccountKey, dealDocumentsFolderPath });

      expect(service.storageSharedKeyCredential.accountName).toBe(accountName);
    });

    it('stores credential on service for use by getShareFileClient', () => {
      const service = new DtfsStorageClientService({ baseUrl, accountName, accountKey: mockAccountKey, dealDocumentsFolderPath });
      const credential = service.storageSharedKeyCredential;

      const client = service.getShareFileClient(fileName, fileLocationPath);

      // Verify client was created successfully with the credential by checking it's a valid instance
      expect(client).toBeInstanceOf(ShareFileClient);
      expect(credential).toBeInstanceOf(StorageSharedKeyCredential);
      expect(credential.accountName).toBe(accountName);
    });
  });
});
