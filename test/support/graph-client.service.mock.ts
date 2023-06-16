import { Client } from '@microsoft/microsoft-graph-client';

export const getMockGraph2ClientService = (): {
  mockGraphClientService;
  mockRequest: { filter: jest.Mock; get: jest.Mock; expand: jest.Mock };
} => {
  const mockClient = {
    api: jest.fn().mockImplementation(() => mockRequest),
  } as unknown as Client;

  // As we add additional methods that use GraphRequest, add them here to allow for mocking.
  const mockRequest = { filter: jest.fn(), get: jest.fn(), expand: jest.fn() };

  const mockGraphClientService = {
    client: mockClient,
  };

  return {
    mockGraphClientService,
    mockRequest,
  };
};
