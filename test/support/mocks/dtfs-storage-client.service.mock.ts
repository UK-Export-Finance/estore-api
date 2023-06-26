import { FileGetPropertiesResponse, RestError, ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { when } from 'jest-when';

class MockFileShareClient {
  getProperties: jest.Mock;
  constructor() {
    this.getProperties = jest.fn();
  }
}

export class MockDtfsStorageClientService {
  readonly baseUrl: string;
  readonly storageSharedKeyCredential: StorageSharedKeyCredential;
  fileShareClient: ShareFileClient;
  getShareFileClient: jest.Mock;

  constructor() {
    (this.baseUrl = null), (this.storageSharedKeyCredential = null), (this.fileShareClient = new MockFileShareClient() as unknown as ShareFileClient);
    this.getShareFileClient = jest.fn();
  }

  mockSuccessfulGetShareFileClientCall(fileName: string, fileLocationPath: string): void {
    when(this.getShareFileClient).calledWith(fileName, fileLocationPath).mockReturnValueOnce(this.fileShareClient);
  }

  mockSuccessfulGetPropertiesCall(fileSizeInBytes: number): void {
    when(this.fileShareClient.getProperties)
      .calledWith()
      .mockResolvedValueOnce({ contentLength: fileSizeInBytes } as FileGetPropertiesResponse);
  }

  mockUnsuccessfulGetPropertiesCall(error: RestError): void {
    when(this.fileShareClient.getProperties).calledWith().mockRejectedValueOnce(error);
  }
}
