import { Client, GraphRequest, LargeFileUploadSession, LargeFileUploadTaskOptions } from '@microsoft/microsoft-graph-client';
import { when } from 'jest-when';
import { Readable } from 'stream';

class MockClient {
  api: jest.Mock;
  constructor() {
    this.api = jest.fn() as jest.Mock;
  }
}

class MockFileUploadTask {
  upload: jest.Mock;
  constructor() {
    this.upload = jest.fn() as jest.Mock;
  }
}

export class MockGraphRequest {
  expand: jest.Mock;
  filter: jest.Mock;
  top: jest.Mock;
  get: jest.Mock;
  patch: jest.Mock;
  post: jest.Mock;

  constructor() {
    this.expand = jest.fn().mockReturnValue(this);
    this.filter = jest.fn().mockReturnValue(this);
    this.top = jest.fn().mockReturnValue(this);
    this.get = jest.fn() as jest.Mock;
    this.patch = jest.fn() as jest.Mock;
    this.post = jest.fn() as jest.Mock;
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

  mockSuccessfulTopCallWithTopNumber(topNumber: number): MockGraphRequest {
    when(this.top)
      .calledWith(topNumber)
      .mockReturnValueOnce(this as unknown as GraphRequest);
    return this;
  }

  mockSuccessfulTopCall(): MockGraphRequest {
    return this.mockSuccessfulTopCallWithTopNumber(expect.anything());
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

  mockUnsuccessfulGraphPatchCallWithRequestBody(requestBody, error: unknown): MockGraphRequest {
    when(this.patch).calledWith(requestBody).mockRejectedValueOnce(error);
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
    this.getFileUploadSession = jest.fn() as jest.Mock;
    this.getFileUploadTask = jest.fn() as jest.Mock;
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

  mockSuccessfulUploadCall(): MockGraphClientService {
    when(this.mockFileUploadTask.upload).calledWith().mockResolvedValueOnce({});
    return this;
  }

  mockUnsuccessfulUploadCall(error: unknown): MockGraphClientService {
    when(this.mockFileUploadTask.upload).calledWith().mockRejectedValueOnce(error);
    return this;
  }
}
