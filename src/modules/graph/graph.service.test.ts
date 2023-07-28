import { GraphError } from '@microsoft/microsoft-graph-client';
import { TermsFacilityExistsException } from '@ukef/modules/terms/exception/terms-facility-exists.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService, MockGraphRequest } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { withSharedGraphExceptionHandlingTests } from './graph.test-parts/with-shared-graph-exception-handling-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const path = valueGenerator.string();
  const filterStr = valueGenerator.string();
  const expandStr = valueGenerator.string();
  const expectedResponse = valueGenerator.string();

  const mockGraphClientService = new MockGraphClientService();

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
    withSharedGraphExceptionHandlingTests({
      mockGraphEndpointToErrorWith: (error: unknown) => mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphGetCall(error),
      makeRequest: () => graphService.get({ path }),
    });

    it('calls the correct graph client methods on a graph service get request with no additional parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        filterCalled: false,
        expandCalled: false,
        getCalled: true,
      });

      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls the correct graph client methods on a graph service get request with one additional parameter and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        filterCalled: true,
        expandCalled: false,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls all graph client methods on a graph service get request with multiple parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr, expand: expandStr });

      const expectations = getCallExpectations(request, {
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
    withSharedGraphExceptionHandlingTests({
      mockGraphEndpointToErrorWith: (error: unknown) =>
        mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphPostCallWithRequestBody(requestBody, error),
      makeRequest: () => graphService.post({ path, requestBody }),
    });

    it('calls the correct graph client methods on a graph service post request with no additional parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphPostRequest();

      const result = await graphService.post<string>({ path, requestBody });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        postCalled: true,
      });
      expectations.forEach((expectation) => expectation(requestBody));

      expect(result).toEqual(expectedPostResponse);
    });

    it(`throws a TermsFacilityExistsException if SharePoint responds with a 400 response containing 'One or more fields with unique constraints already has the provided value'`, async () => {
      const graphError = new GraphError(400, 'One or more fields with unique constraints already has the provided value.');
      graphError.code = 'invalidRequest';

      mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphPostCallWithRequestBody(requestBody, graphError);

      const graphServicePromise = graphService.post<string>({ path, requestBody });

      await expect(graphServicePromise).rejects.toBeInstanceOf(TermsFacilityExistsException);
      await expect(graphServicePromise).rejects.toThrow('Facility Term item with this identifier already exists.');
      await expect(graphServicePromise).rejects.toHaveProperty('innerError', graphError);
    });
  });

  const mockSuccessfulCompleteGraphRequest = () =>
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expandStr)
      .mockSuccessfulFilterCallWithFilterString(filterStr)
      .mockSuccessfulGraphGetCall(expectedResponse);

  const mockSuccessfulCompleteGraphPostRequest = () =>
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expandStr)
      .mockSuccessfulFilterCallWithFilterString(filterStr)
      .mockSuccessfulGraphPostCallWithRequestBody(requestBody, expectedPostResponse);

  const getCallExpectations = (
    request: MockGraphRequest,
    {
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
    },
  ) => {
    const apiCallExpectations = apiCalled
      ? [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1), () => expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path)]
      : [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(0)];

    const filterCallExpectations = filterCalled
      ? [() => expect(request.filter).toHaveBeenCalledTimes(1), () => expect(request.filter).toHaveBeenCalledWith(filterStr)]
      : [() => expect(request.filter).toHaveBeenCalledTimes(0)];

    const expandCallExpectations = expandCalled
      ? [() => expect(request.expand).toHaveBeenCalledTimes(1), () => expect(request.expand).toHaveBeenCalledWith(expandStr)]
      : [() => expect(request.expand).toHaveBeenCalledTimes(0)];

    const getCallExpectations = getCalled
      ? [() => expect(request.get).toHaveBeenCalledTimes(1), () => expect(request.get).toHaveBeenCalledWith()]
      : [() => expect(request.get).toHaveBeenCalledTimes(0)];

    const postCallExpectations = postCalled
      ? [() => expect(request.post).toHaveBeenCalledTimes(1), (requestBody?) => expect(request.post).toHaveBeenCalledWith(requestBody)]
      : [() => expect(request.post).toHaveBeenCalledTimes(0)];

    return [...apiCallExpectations, ...filterCallExpectations, ...expandCallExpectations, ...getCallExpectations, ...postCallExpectations];
  };
});
