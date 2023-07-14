import { Client, GraphRequest, LargeFileUploadSession, LargeFileUploadTaskOptions, LargeFileUploadSession, LargeFileUploadTaskOptions } from '@microsoft/microsoft-graph-client';
import { when } from 'jest-when';
import { Readable } from 'stream';
import { Readable } from 'stream';

class MockClient {
  api: jest.Mock;
  constructor() {
    this.api = jest.fn();
  }
}

class MockRequest {
  get: jest.Mock<any, any, any>;
  post: jest.Mock<any, any, any>;
  patch: jest.Mock<any, any, any>;
  patch: jest.Mock<any, any, any>;
  filter: jest.Mock<any, any, any>;
  expand: jest.Mock<any, any, any>;

  constructor() {
    this.get = jest.fn();
    this.post = jest.fn();
    this.patch = jest.fn();
    this.patch = jest.fn();
    this.filter = jest.fn();
    this.expand = jest.fn();
  }
}

class MockFileUploadTask {
  upload: jest.Mock;
  constructor() {
    this.upload = jest.fn();
  }
}

class MockFileUploadTask {
  upload: jest.Mock;
  constructor() {
    this.upload = jest.fn();
  }
}

export class MockGraphClientService {
  client: Client;
  request: GraphRequest;
  mockFileUploadTask: MockFileUploadTask;
  getFileUploadSession: jest.Mock;
  getFileUploadTask: jest.Mock;
  mockFileUploadTask: MockFileUploadTask;
  getFileUploadSession: jest.Mock;
  getFileUploadTask: jest.Mock;

  constructor() {
    this.client = new MockClient() as unknown as Client;
    this.request = new MockRequest() as unknown as GraphRequest;
    this.mockFileUploadTask = new MockFileUploadTask();
    this.getFileUploadSession = jest.fn();
    this.getFileUploadTask = jest.fn();
    this.mockFileUploadTask = new MockFileUploadTask();
    this.getFileUploadSession = jest.fn();
    this.getFileUploadTask = jest.fn();
  }

  getApiRequestObject(): GraphRequest {
    return this.request;
  }

  mockSuccessfulGraphGetCall<T>(response: T): MockGraphClientService {
    when(this.request.get).calledWith().mockResolvedValueOnce(response);
    return this;
    return this;
  }

  mockUnsuccessfulGraphGetCall(error: unknown): MockGraphClientService {
    when(this.request.get).calledWith().mockRejectedValueOnce(error);
    return this;
    return this;
  }

  mockSuccessfulGraphPostCall<T>(response?: T): MockGraphClientService: MockGraphClientService {
    when(this.request.post).calledWith(expect.anything()).mockResolvedValueOnce(response);
    return this;
    return this;
  }

  mockSuccessfulGraphPostCallWithRequestBody<T, U>(requestBody: T, response?: U): MockGraphClientService: MockGraphClientService {
    when(this.request.post).calledWith(requestBody).mockResolvedValueOnce(response);
    return this;
    return this;
  }

  mockUnsuccessfulGraphPostCallWithRequestBody(requestBody, error: unknown): MockGraphClientService: MockGraphClientService {
    when(this.request.post).calledWith(requestBody).mockRejectedValueOnce(error);
    return this;
  }

  mockSuccessfulGraphPatchCallWithRequestBody<T, U>(requestBody: T, response?: U): MockGraphClientService {
    when(this.request.patch).calledWith(requestBody).mockResolvedValueOnce(response);
    return this;
    return this;
  }

  mockSuccessfulGraphPatchCallWithRequestBody<T, U>(requestBody: T, response?: U): MockGraphClientService {
    when(this.request.patch).calledWith(requestBody).mockResolvedValueOnce(response);
    return this;
  }

  mockSuccessfulGraphApiCall(): MockGraphClientService {
    when(this.client.api).calledWith(expect.anything()).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulGraphApiCallWithPath(path: string): MockGraphClientService {
    when(this.client.api).calledWith(path).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulFilterCall(): MockGraphClientService {
    when(this.request.filter).calledWith(expect.anything()).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulFilterCallWithFilterString(filterString: string): MockGraphClientService {
    when(this.request.filter).calledWith(filterString).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulExpandCall(): MockGraphClientService {
    when(this.request.expand).calledWith(expect.anything()).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulExpandCallWithExpandString(expandString: string): MockGraphClientService {
    when(this.request.expand).calledWith(expandString).mockReturnValueOnce(this.request);
    return this;
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
}
