import { FileDownloadResponseModel, FileGetPropertiesResponse, RestError, ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { when } from 'jest-when';

class MockFileShareClient {
  getProperties: jest.Mock;
  download: jest.Mock;
  constructor() {
    this.getProperties = jest.fn() as jest.Mock;
    this.download = jest.fn() as jest.Mock;
  }
}

export class MockDtfsStorageClientService {
  readonly baseUrl: string;
  readonly dealDocumentsFolderPath: string;
  readonly storageSharedKeyCredential: StorageSharedKeyCredential;
  fileShareClient: ShareFileClient;
  getShareFileClient: jest.Mock;

  constructor() {
    this.baseUrl = null;
    this.dealDocumentsFolderPath = null;
    this.storageSharedKeyCredential = null;
    this.fileShareClient = new MockFileShareClient() as unknown as ShareFileClient;
    this.getShareFileClient = jest.fn() as jest.Mock;
  }

  mockSuccessfulGetShareFileClientCall(fileName: string, fileLocationPath: string): MockDtfsStorageClientService {
    when(this.getShareFileClient).calledWith(fileName, fileLocationPath).mockReturnValueOnce(this.fileShareClient);
    return this;
  }

  mockSuccessfulGetPropertiesCall(fileSizeInBytes: number): MockDtfsStorageClientService {
    when(this.fileShareClient.getProperties)
      .calledWith()
      .mockResolvedValueOnce({ contentLength: fileSizeInBytes } as FileGetPropertiesResponse);
    return this;
  }

  mockUnsuccessfulGetPropertiesCall(error: RestError): MockDtfsStorageClientService {
    when(this.fileShareClient.getProperties).calledWith().mockRejectedValueOnce(error);
    return this;
  }

  mockSuccessfulDownloadCall(file: { readableStreamBody: NodeJS.ReadableStream; _response: unknown }): MockDtfsStorageClientService {
    when(this.fileShareClient.download)
      .calledWith()
      .mockResolvedValueOnce(file as FileDownloadResponseModel);
    return this;
  }

  mockUnsuccessfulDownloadCall(error: RestError): MockDtfsStorageClientService {
    when(this.fileShareClient.download).calledWith().mockRejectedValueOnce(error);
    return this;
  }
}
