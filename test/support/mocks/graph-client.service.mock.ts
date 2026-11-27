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

    // Track filter values so get() can respond based on which filter was called
    let currentFilter: string | null = null;
    this.filter = jest.fn((arg: string) => {
      currentFilter = arg;
      return this;
    });

    this.top = jest.fn().mockReturnValue(this);

    // Store responses as separate queues:
    // - unfiltered: consumed in FIFO order, last one is reused
    // - byFilter: responses matched by specific filter, consumed per filter
    const unfilteredResponses: Array<{ response: any; isError: boolean }> = [];
    const responsesByFilter: Map<string, Array<{ response: any; isError: boolean }>> = new Map();
    let unfilteredIndex = 0;

    this.get = jest.fn(() => {
      if (currentFilter && responsesByFilter.has(currentFilter)) {
        // Filter-specific responses: consume in order
        const filterResponses = responsesByFilter.get(currentFilter)!;
        let index = (this.get as any).__filterIndices?.get(currentFilter) ?? 0;

        if (index < filterResponses.length) {
          const { response, isError } = filterResponses[index];

          // Advance index for next call with this filter
          if (index < filterResponses.length - 1) {
            index++;

            if (!(this.get as any).__filterIndices) {
              (this.get as any).__filterIndices = new Map();
            }

            (this.get as any).__filterIndices.set(currentFilter, index);
          }

          return isError ? Promise.reject(response) : Promise.resolve(response);
        }
      }

      // Fall back to unfiltered responses
      if (unfilteredResponses.length === 0) {
        return Promise.reject(new Error('No mocked response available for .get()'));
      }

      // Read the current response before advancing the index
      const { response, isError } = unfilteredResponses[unfilteredIndex];

      // Consume unfiltered responses in order, reusing the final entry
      if (unfilteredIndex < unfilteredResponses.length - 1) {
        unfilteredIndex++;
      }

      return isError ? Promise.reject(response) : Promise.resolve(response);
    }) as jest.Mock;

    this.patch = jest.fn() as jest.Mock;
    this.post = jest.fn() as jest.Mock;

    // Store response arrays on the mock for access by test setup methods
    (this.get as any).__unfilteredResponses = unfilteredResponses;
    (this.get as any).__responsesByFilter = responsesByFilter;
    (this.get as any).__filterIndices = new Map();
    (this.get as any).__resetAll = () => {
      unfilteredResponses.length = 0;
      responsesByFilter.clear();
      unfilteredIndex = 0;
      (this.get as any).__filterIndices.clear();
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
    const unfilteredResponses = (this.get as any).__unfilteredResponses as Array<{ response: any; isError: boolean }>;
    unfilteredResponses.push({ response, isError: false });
    return this;
  }

  mockSuccessfulGraphGetCallForFilterString<T>(filterString: string, response: T): MockGraphRequest {
    const responsesByFilter = (this.get as any).__responsesByFilter as Map<string, Array<{ response: any; isError: boolean }>>;

    if (!responsesByFilter.has(filterString)) {
      responsesByFilter.set(filterString, []);
    }

    responsesByFilter.get(filterString)!.push({ response, isError: false });
    return this;
  }

  mockUnsuccessfulGraphGetCall(error: unknown): MockGraphRequest {
    const unfilteredResponses = (this.get as any).__unfilteredResponses as Array<{ response: any; isError: boolean }>;
    unfilteredResponses.push({ response: error, isError: true });
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
    // Preserve distinct registrations: if a request already exists for this path,
    // return it instead of overwriting it. This allows multiple filters or response
    // sequences to register different data for the same path within a single test.
    // Note: Tests must call mockGraphClientService.reset() in beforeEach to clear
    // path registrations between tests, otherwise responses from previous tests
    // will accumulate.
    let mockRequest = this.pathToRequestMap.get(path);

    if (!mockRequest) {
      mockRequest = new MockGraphRequest();
      this.pathToRequestMap.set(path, mockRequest);
    }

    // Also re-establish the implementation in case mocks were reset
    this.setupApiMock();
    return mockRequest;
  }

  mockSuccessfulGraphGetCallForDefaultRequest<T>(response: T): MockGraphClientService {
    return this.mockSuccessfulGraphGetCallForRequest(this.defaultMockRequest, response);
  }

  mockSuccessfulGraphPostCallForDefaultRequest<T>(response: T): MockGraphClientService {
    return this.mockSuccessfulGraphPostCallForRequest(this.defaultMockRequest, response);
  }

  private mockSuccessfulGraphGetCallForRequest<T>(mockRequest: MockGraphRequest, response: T): MockGraphClientService {
    const unfilteredResponses = (mockRequest.get as any).__unfilteredResponses as Array<{ response: any; isError: boolean }>;
    unfilteredResponses.push({ response, isError: false });
    return this;
  }

  private mockSuccessfulGraphPostCallForRequest<T>(mockRequest: MockGraphRequest, response: T): MockGraphClientService {
    when(mockRequest.post).calledWith(expect.anything()).mockResolvedValue(response);
    return this;
  }

  clearAllMocks(): void {
    // Clear responses in all mocked requests when jest.resetAllMocks is called
    this.pathToRequestMap.forEach((mockRequest) => {
      const resetAll = (mockRequest.get as any).__resetAll as () => void;
      resetAll();
    });
    // Also clear default mock
    const defaultResetAll = (this.defaultMockRequest.get as any).__resetAll as () => void;
    defaultResetAll();
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
