import { Client, GraphRequest, LargeFileUploadSession, LargeFileUploadTaskOptions } from '@microsoft/microsoft-graph-client';
import { when } from 'jest-when';
import { Readable } from 'stream';

class MockClient {
  api: jest.Mock;
  constructor() {
    this.api = jest.fn();
  }
}

class MockFileUploadTask {
  upload: jest.Mock;
  constructor() {
    this.upload = jest.fn();
  }
}

export class MockGraphRequest {
  expand: GraphRequest['expand'];
  filter: GraphRequest['filter'];
  get: GraphRequest['get'];
  patch: GraphRequest['patch'];
  post: GraphRequest['post'];

  constructor() {
    this.expand = jest.fn();
    this.filter = jest.fn();
    this.get = jest.fn();
    this.patch = jest.fn();
    this.post = jest.fn();
  }

  mockSuccessfulExpandCallWithExpandString(expandString: string): MockGraphRequest {
    when(this.expand)
      .calledWith(expandString)
      .mockReturnValueOnce(this as unknown as GraphRequest);
    return this;
  }

  mockSuccessfulExpandCall(): MockGraphRequest {
    return this.mockSuccessfulExpandCallWithExpandString(expect.anything());
  }

  mockSuccessfulFilterCallWithFilterString(filterString: string): MockGraphRequest {
    when(this.filter)
      .calledWith(filterString)
      .mockReturnValueOnce(this as unknown as GraphRequest);
    return this;
  }

  mockSuccessfulFilterCall(): MockGraphRequest {
    return this.mockSuccessfulFilterCallWithFilterString(expect.anything());
  }

  mockSuccessfulGraphGetCall<T>(response: T): MockGraphRequest {
    when(this.get).calledWith().mockResolvedValueOnce(response);
    return this;
  }

  mockUnsuccessfulGraphGetCall(error: unknown): MockGraphRequest {
    when(this.get).calledWith().mockRejectedValueOnce(error);
    return this;
  }

  mockSuccessfulGraphPostCallWithRequestBody<T, U>(requestBody: T, response?: U): MockGraphRequest {
    when(this.post).calledWith(requestBody).mockResolvedValueOnce(response);
    return this;
  }

  mockUnsuccessfulGraphPostCallWithRequestBody(requestBody, error: unknown): MockGraphRequest {
    when(this.post).calledWith(requestBody).mockRejectedValueOnce(error);
    return this;
  }

  mockSuccessfulGraphPatchCallWithRequestBody<T, U>(requestBody: T, response?: U): MockGraphRequest {
    when(this.patch).calledWith(requestBody).mockResolvedValueOnce(response);
    return this;
  }
}

export class MockGraphClientService {
  client: Client;
  request: GraphRequest;
  mockFileUploadTask: MockFileUploadTask;
  getFileUploadSession: jest.Mock;
  getFileUploadTask: jest.Mock;

  constructor() {
    this.client = new MockClient() as unknown as Client;
    this.request = new MockGraphRequest() as unknown as GraphRequest;
    this.mockFileUploadTask = new MockFileUploadTask();
    this.getFileUploadSession = jest.fn();
    this.getFileUploadTask = jest.fn();
  }

  mockSuccessfulGraphApiCallWithPath(path: string): MockGraphRequest {
    const mockRequest = new MockGraphRequest();
    when(this.client.api)
      .calledWith(path)
      .mockReturnValueOnce(mockRequest as unknown as GraphRequest);
    return mockRequest;
  }

  mockSuccessfulGetFileUploadSessionCall(url: string, headers: unknown, uploadSessionToReturn: LargeFileUploadSession): MockGraphClientService {
    when(this.getFileUploadSession).calledWith(url, headers).mockResolvedValueOnce(uploadSessionToReturn);
    return this;
  }

  mockSuccessfulGetFileUploadTaskCall(
    fileName: string,
    fileSizeInBytes: number,
    uploadSession: LargeFileUploadSession,
    options?: LargeFileUploadTaskOptions,
  ): MockGraphClientService {
    when(this.getFileUploadTask)
      .calledWith(expect.any(Readable), fileName, fileSizeInBytes, uploadSession, options)
      .mockReturnValueOnce(this.mockFileUploadTask);
    return this;
  }

  mockUnsuccessfulUploadCall(error: unknown): MockGraphClientService {
    when(this.mockFileUploadTask.upload).calledWith().mockRejectedValueOnce(error);
    return this;
  }

  mockSuccessfulUploadCall(): MockGraphClientService {
    when(this.mockFileUploadTask.upload).calledWith().mockResolvedValueOnce({});
    return this;
  }
}
