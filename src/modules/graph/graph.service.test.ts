import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';

import GraphService from './graph.service';
import { withCommonGraphExceptionHandlingTests } from './graph.test-parts/with-common-graph-exception-handling-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const path = valueGenerator.string();
  const filterStr = valueGenerator.string();
  const expandStr = valueGenerator.string();
  const expectedResponse = valueGenerator.string();

  const mockGraphClientService = new MockGraphClientService();

  const mockRequest = mockGraphClientService.getApiRequestObject();

  const requestBody = {
    exporterName: valueGenerator.string(),
  };
  const expectedPostResponse = valueGenerator.string();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService);
    jest.resetAllMocks();
  });

  describe('get', () => {
    withCommonGraphExceptionHandlingTests({
      mockSuccessfulGraphApiCall: () => mockSuccessfulGraphApiCall(),
      mockGraphEndpointToErrorWith: (error: unknown) => mockGraphClientService.mockUnsuccessfulGraphGetCall(error),
      makeRequest: () => graphService.get({ path }),
    });

    it('calls the correct graph client methods on a graph service get request with no additional parameters and returns the response', async () => {
      mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path });

      expectGraphMethodsToHaveBeenCalled({
        apiCalled: true,
        filterCalled: false,
        expandCalled: false,
        getCalled: true,
      });

      expect(result).toEqual(expectedResponse);
    });

    it('calls the correct graph client methods on a graph service get request with one additional parameter and returns the response', async () => {
      mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr });

      expectGraphMethodsToHaveBeenCalled({
        apiCalled: true,
        filterCalled: true,
        expandCalled: false,
        getCalled: true,
      });

      expect(result).toEqual(expectedResponse);
    });

    it('calls all graph client methods on a graph service get request with multiple parameters and returns the response', async () => {
      mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr, expand: expandStr });

      expectGraphMethodsToHaveBeenCalled({
        apiCalled: true,
        filterCalled: true,
        expandCalled: true,
        getCalled: true,
      });

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('post', () => {
    withCommonGraphExceptionHandlingTests({
      mockSuccessfulGraphApiCall: () => mockSuccessfulGraphApiCall(),
      //mockGraphEndpointToErrorWith: (error: unknown) => when(mockRequest.post).calledWith(requestBody).mockRejectedValue(error),
      mockGraphEndpointToErrorWith: (error: unknown) => mockGraphClientService.mockUnsuccessfulGraphPostCall(requestBody, error),
      makeRequest: () => graphService.post({ path, requestBody }),
    });

    it('calls the correct graph client methods on a graph service post request with no additional parameters and returns the response', async () => {
      mockSuccessfulCompletePostGraphRequest();

      const result = await graphService.post<string>({ path, requestBody });

      expectGraphMethodsToHaveBeenCalled({
        apiCalled: true,
        postCalled: true,
      });

      expect(result).toEqual(expectedPostResponse);
    });
  });

  const mockSuccessfulGraphApiCall = () => mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path);

  const mockSuccessfulChainingCalls = () => {
    mockGraphClientService.mockSuccessfulExpandCallWithExpandString(expandStr).mockSuccessfulFilterCallWithFilterString(filterStr);
  };

  const mockSuccessfulGraphGetCall = () => mockGraphClientService.mockSuccessfulGraphGetCall(expectedResponse);

  const mockSuccessfulGraphPostCall = () => mockGraphClientService.mockSuccessfulGraphPostCall(requestBody, expectedPostResponse);

  const mockSuccessfulCompleteGraphRequest = () => {
    mockSuccessfulGraphApiCall();
    mockSuccessfulChainingCalls();
    mockSuccessfulGraphGetCall();
  };

  const mockSuccessfulCompletePostGraphRequest = () => {
    mockSuccessfulGraphApiCall();
    mockSuccessfulChainingCalls();
    mockSuccessfulGraphPostCall();
  };

  const expectGraphMethodsToHaveBeenCalled = ({
    apiCalled = false,
    filterCalled = false,
    expandCalled = false,
    getCalled = false,
    postCalled = false,
  }: {
    apiCalled?: boolean;
    filterCalled?: boolean;
    expandCalled?: boolean;
    getCalled?: boolean;
    postCalled?: boolean;
  }) => {
    apiCalled
      ? (expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1), expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path))
      : expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(0);
    filterCalled
      ? (expect(mockRequest.filter).toHaveBeenCalledTimes(1), expect(mockRequest.filter).toHaveBeenCalledWith(filterStr))
      : expect(mockRequest.filter).toHaveBeenCalledTimes(0);
    expandCalled
      ? (expect(mockRequest.expand).toHaveBeenCalledTimes(1), expect(mockRequest.expand).toHaveBeenCalledWith(expandStr))
      : expect(mockRequest.expand).toHaveBeenCalledTimes(0);
    getCalled
      ? (expect(mockRequest.get).toHaveBeenCalledTimes(1), expect(mockRequest.get).toHaveBeenCalledWith())
      : expect(mockRequest.get).toHaveBeenCalledTimes(0);
    postCalled
      ? (expect(mockRequest.post).toHaveBeenCalledTimes(1), expect(mockRequest.post).toHaveBeenCalledWith(requestBody))
      : expect(mockRequest.post).toHaveBeenCalledTimes(0);
  };
});
