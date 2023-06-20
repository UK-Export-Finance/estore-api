import GraphClientService from '@ukef/modules/graph-client/graph-client.service';

export const getMockGraphClientService = (): {
  mockGraphClientService: GraphClientService;
  mockClient: { api: jest.Mock };
  mockRequest: { filter: jest.Mock; get: jest.Mock; post: jest.Mock; expand: jest.Mock };
} => {
  const mockClient = {
    api: jest.fn(),
  };

  const mockRequest = { filter: jest.fn(), get: jest.fn(), post: jest.fn(), expand: jest.fn() };

  const mockGraphClientService = {
    getClient: () => mockClient,
  } as unknown as GraphClientService;

  return {
    mockGraphClientService,
    mockClient,
    mockRequest,
  };
};
