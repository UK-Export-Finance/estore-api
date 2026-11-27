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

    // Store responses as an array for FIFO consumption
    // Multiple calls to .get() consume responses in order, with reuse of the last one
    const responses: Array<{ response: any; isError: boolean }> = [];
    let currentIndex = 0;

    this.get = jest.fn(() => {
      if (responses.length === 0) {
        return Promise.reject(new Error('No mocked response available for .get()'));
      }

      // Consume responses in FIFO order, but reuse the last one
      if (currentIndex < responses.length - 1) {
        currentIndex++;
      }

      const { response, isError } = responses[currentIndex];
      return isError ? Promise.reject(response) : Promise.resolve(response);
    }) as jest.Mock;

    this.patch = jest.fn() as jest.Mock;
    this.post = jest.fn() as jest.Mock;

    // Store responses array and state on the mock for access by test setup methods
    (this.get as any).__responses = responses;
    (this.get as any).__currentIndex = (() => currentIndex) as () => number;
    (this.get as any).__resetIndex = () => {
      currentIndex = 0;
    };
  }

  mockSuccessfulExpandCallWithExpandString(expandString: string): MockGraphRequest {
    when(this.expand)
      .calledWith(expandString)
      .mockReturnValue(this as unknown as GraphRequest);
    return this;
  }

  mockSuccessfulExpandCall(): MockGraphRequest {
    return this.mockSuccessfulExpandCallWithExpandString(expect.anything());
  }

  mockSuccessfulTopCallWithTopNumber(topNumber: number): MockGraphRequest {
    when(this.top)
      .calledWith(topNumber)
      .mockReturnValue(this as unknown as GraphRequest);
    return this;
  }

  mockSuccessfulTopCall(): MockGraphRequest {
    return this.mockSuccessfulTopCallWithTopNumber(expect.anything());
  }

  mockSuccessfulFilterCallWithFilterString(filterString: string): MockGraphRequest {
    when(this.filter)
      .calledWith(filterString)
      .mockReturnValue(this as unknown as GraphRequest);
    return this;
  }

  mockSuccessfulFilterCall(): MockGraphRequest {
    return this.mockSuccessfulFilterCallWithFilterString(expect.anything());
  }

  mockSuccessfulGraphGetCall<T>(response: T): MockGraphRequest {
    const responses = (this.get as any).__responses as Array<{ response: any; isError: boolean }>;
    responses.push({ response, isError: false });
    return this;
  }

  mockUnsuccessfulGraphGetCall(error: unknown): MockGraphRequest {
    const responses = (this.get as any).__responses as Array<{ response: any; isError: boolean }>;
    responses.push({ response: error, isError: true });
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
  private pathToRequestMap: Map<string, MockGraphRequest>;
  private defaultMockRequest: MockGraphRequest;

  constructor() {
    this.client = new MockClient() as unknown as Client;
    this.request = new MockGraphRequest() as unknown as GraphRequest;
    this.mockFileUploadTask = new MockFileUploadTask();
    this.getFileUploadSession = jest.fn() as jest.Mock;
    this.getFileUploadTask = jest.fn() as jest.Mock;
    this.pathToRequestMap = new Map();
    this.defaultMockRequest = new MockGraphRequest();

    this.setupApiMock();
  }

  private setupApiMock(): void {
    // Don't close over pathToRequestMap and defaultMockRequest - look them up each time!
    (this.client.api as jest.Mock).mockImplementation((path: string) => {
      const mockRequest = this.pathToRequestMap.get(path);
      return mockRequest || this.defaultMockRequest;
    });
  }

  reset(): void {
    // Clear all mocks and reset indices for next test
    this.pathToRequestMap.clear();
    this.defaultMockRequest = new MockGraphRequest();
    this.clearAllMocks();
    this.setupApiMock();
  }

  mockSuccessfulGraphApiCallWithPath(path: string): MockGraphRequest {
    const mockRequest = new MockGraphRequest();
    this.pathToRequestMap.set(path, mockRequest);
    // Also re-establish the implementation in case mocks were reset
    this.setupApiMock();
    return mockRequest;
  }

  clearAllMocks(): void {
    // Clear responses in all mocked requests when jest.resetAllMocks is called
    this.pathToRequestMap.forEach((mockRequest) => {
      const responses = (mockRequest.get as any).__responses as Array<any>;
      responses.length = 0;
      const resetIndex = (mockRequest.get as any).__resetIndex as () => void;
      resetIndex();
    });
    // Also clear default mock
    const defaultResponses = (this.defaultMockRequest.get as any).__responses as Array<any>;
    defaultResponses.length = 0;
    const defaultResetIndex = (this.defaultMockRequest.get as any).__resetIndex as () => void;
    defaultResetIndex();
  }

  mockSuccessfulGetFileUploadSessionCall(url: string, headers: unknown, uploadSessionToReturn: LargeFileUploadSession): MockGraphClientService {
    when(this.getFileUploadSession).calledWith(url, headers).mockResolvedValue(uploadSessionToReturn);
    return this;
  }

  mockSuccessfulGetFileUploadTaskCall(
    fileName: string,
    fileSizeInBytes: number,
    uploadSession: LargeFileUploadSession,
    options?: LargeFileUploadTaskOptions,
  ): MockGraphClientService {
    when(this.getFileUploadTask).calledWith(expect.any(Readable), fileName, fileSizeInBytes, uploadSession, options).mockReturnValue(this.mockFileUploadTask);
    return this;
  }

  mockSuccessfulUploadCall(): MockGraphClientService {
    when(this.mockFileUploadTask.upload).calledWith().mockResolvedValue({});
    return this;
  }

  mockUnsuccessfulUploadCall(error: unknown): MockGraphClientService {
    when(this.mockFileUploadTask.upload).calledWith().mockRejectedValue(error);
    return this;
  }
}
