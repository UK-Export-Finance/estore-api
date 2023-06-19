import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import { when } from 'jest-when';

class MockClient {
  api: jest.Mock;
  constructor() {
    this.api = jest.fn();
  }
}

class MockRequest {
  get: jest.Mock<any, any, any>;
  filter: jest.Mock<any, any, any>;
  expand: jest.Mock<any, any, any>;
  constructor() {
    this.get = jest.fn();

    this.filter = jest.fn();
    this.expand = jest.fn();
  }
}

export class MockGraphClientService {
  client: Client;
  request: GraphRequest;
  constructor() {
    this.client = new MockClient() as unknown as Client;
    this.request = new MockRequest() as unknown as GraphRequest;
  }

  getApiRequestObject() {
    return this.request;
  }

  mockSuccessfulGraphApiCallWithPath(path: string) {
    when(this.client.api).calledWith(path).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulFilterCallWithFilterString(filterString: string) {
    when(this.request.filter).calledWith(filterString).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulExpandCallWithExpandString(expandString: string) {
    when(this.request.expand).calledWith(expandString).mockReturnValueOnce(this.request);
    return this;
  }

  mockSuccessfulGraphGetCall(response) {
    when(this.request.get).calledWith().mockReturnValueOnce(response);
  }

  mockUnsuccessfulGraphGetCall(error: unknown) {
    when(this.request.get).calledWith().mockRejectedValueOnce(error);
  }
}
