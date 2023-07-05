import { GraphError } from '@microsoft/microsoft-graph-client';
import { TermsFacilityExistsException } from '@ukef/modules/terms/exception/terms-facility-exists.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { withKnownGraphExceptionHandlingTests } from './graph.test-parts/with-shared-graph-exception-handling-tests';

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
    resetAllWhenMocks();
  });

  describe('get', () => {
    withKnownGraphExceptionHandlingTests({
      mockSuccessfulGraphApiCall: () => mockSuccessfulGraphApiCall(),
      mockGraphEndpointToErrorWith: (error: unknown) => mockGraphClientService.mockUnsuccessfulGraphGetCall(error),
      makeRequest: () => graphService.get({ path }),
    });

    it('calls the correct graph client methods on a graph service get request with no additional parameters and returns the response', async () => {
      mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path });

      const expectations = getCallExpectations({
        apiCalled: true,
        filterCalled: false,
        expandCalled: false,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls the correct graph client methods on a graph service get request with one additional parameter and returns the response', async () => {
      mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr });

      const expectations = getCallExpectations({
        apiCalled: true,
        filterCalled: true,
        expandCalled: false,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls all graph client methods on a graph service get request with multiple parameters and returns the response', async () => {
      mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr, expand: expandStr });

      const expectations = getCallExpectations({
        apiCalled: true,
        filterCalled: true,
        expandCalled: true,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('post', () => {
    withKnownGraphExceptionHandlingTests({
      mockSuccessfulGraphApiCall: () => mockSuccessfulGraphApiCall(),
      mockGraphEndpointToErrorWith: (error: unknown) => mockGraphClientService.mockUnsuccessfulGraphPostCall(requestBody, error),
      makeRequest: () => graphService.post({ path, requestBody }),
    });

    it('calls the correct graph client methods on a graph service post request with no additional parameters and returns the response', async () => {
      mockSuccessfulCompleteGraphPostRequest();

      const result = await graphService.post<string>({ path, requestBody });

      const expectations = getCallExpectations({
        apiCalled: true,
        postCalled: true,
      });
      expectations.forEach((expectation) => expectation(requestBody));

      expect(result).toEqual(expectedPostResponse);
    });

    it(`throws a TermsFacilityExistsException if SharePoint responds with a 400 response containing 'One or more fields with unique constraints already has the provided value'`, async () => {
      const graphError = new GraphError(400, 'One or more fields with unique constraints already has the provided value.');
      graphError.code = 'invalidRequest';

      mockSuccessfulGraphApiCall();
      mockGraphClientService.mockUnsuccessfulGraphPostCall(requestBody, graphError);

      const graphServicePromise = graphService.post<string>({ path, requestBody });

      await expect(graphServicePromise).rejects.toBeInstanceOf(TermsFacilityExistsException);
      await expect(graphServicePromise).rejects.toThrow('Facility Term item with this identifier already exists.');
      await expect(graphServicePromise).rejects.toHaveProperty('innerError', graphError);
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

  const mockSuccessfulCompleteGraphPostRequest = () => {
    mockSuccessfulGraphApiCall();
    mockSuccessfulChainingCalls();
    mockSuccessfulGraphPostCall();
  };

  const getCallExpectations = ({
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
    const apiCallExpectations = apiCalled
      ? [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1), () => expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path)]
      : [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(0)];

    const filterCallExpectations = filterCalled
      ? [() => expect(mockRequest.filter).toHaveBeenCalledTimes(1), () => expect(mockRequest.filter).toHaveBeenCalledWith(filterStr)]
      : [() => expect(mockRequest.filter).toHaveBeenCalledTimes(0)];

    const expandCallExpectations = expandCalled
      ? [() => expect(mockRequest.expand).toHaveBeenCalledTimes(1), () => expect(mockRequest.expand).toHaveBeenCalledWith(expandStr)]
      : [() => expect(mockRequest.expand).toHaveBeenCalledTimes(0)];

    const getCallExpectations = getCalled
      ? [() => expect(mockRequest.get).toHaveBeenCalledTimes(1), () => expect(mockRequest.get).toHaveBeenCalledWith()]
      : [() => expect(mockRequest.get).toHaveBeenCalledTimes(0)];

    const postCallExpectations = postCalled
      ? [() => expect(mockRequest.post).toHaveBeenCalledTimes(1), (requestBody?) => expect(mockRequest.post).toHaveBeenCalledWith(requestBody)]
      : [() => expect(mockRequest.post).toHaveBeenCalledTimes(0)];

    return [...apiCallExpectations, ...filterCallExpectations, ...expandCallExpectations, ...getCallExpectations, ...postCallExpectations];
  };
});
