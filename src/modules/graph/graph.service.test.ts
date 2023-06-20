import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { getMockGraphClientService } from '@ukef-test/support/graph-client.service.mock';
import { when } from 'jest-when';

import GraphService from './graph.service';
import { withCommonGraphExceptionHandlingTests } from './graph.test-parts/with-common-graph-exception-handling-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const path = valueGenerator.string();
  const filterStr = valueGenerator.string();
  const expandStr = valueGenerator.string();
  const expectedResponse = valueGenerator.string();
  const requestBody = {
    exporterName: valueGenerator.string(),
  };
  const expectedPostResponse = valueGenerator.string();

  const { mockGraphClientService, mockClient, mockRequest } = getMockGraphClientService();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService);
    jest.resetAllMocks();
  });

  describe('get', () => {
    withCommonGraphExceptionHandlingTests({
      mockSuccessfulGraphApiCall: () => mockSuccessfulGraphApiCall(),
      mockGraphEndpointToErrorWith: (error: unknown) => when(mockRequest.get).calledWith().mockRejectedValue(error),
      makeRequest: () => graphService.get({ path }),
    });

    it('calls the correct graph client methods on a graph service get request and returns the response', async () => {
      mockSuccessfulGraphApiCall();
      mockSuccessfulGraphGetCall();

      const result = await graphService.get<string>({ path });

      expect(mockClient.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      expect(mockClient.api).toHaveBeenCalledWith(path);
      expect(mockRequest.get).toHaveBeenCalledWith();

      expect(result).toEqual(expectedResponse);
    });

    it('does not call graph client methods not included on a graph service get request', async () => {
      mockSuccessfulGraphApiCall();

      await graphService.get<string>({ path });

      expect(mockRequest.filter).toHaveBeenCalledTimes(0);
      expect(mockRequest.expand).toHaveBeenCalledTimes(0);
    });

    it('calls the correct graph client methods on a graph service get request with one additional parameter and returns the response', async () => {
      mockSuccessfulGraphApiCall();
      mockSuccessfulGraphGetCall();
      when(mockRequest.filter).calledWith(filterStr).mockReturnValueOnce(mockRequest);

      const result = await graphService.get<string>({ path, filter: filterStr });

      expect(mockClient.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.filter).toHaveBeenCalledTimes(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      expect(mockClient.api).toHaveBeenCalledWith(path);
      expect(mockRequest.filter).toHaveBeenCalledWith(filterStr);
      expect(mockRequest.get).toHaveBeenCalledWith();

      expect(result).toEqual(expectedResponse);
    });

    it('does not call graph client methods not included on a graph service get request one additional parameter', async () => {
      mockSuccessfulGraphApiCall();
      mockSuccessfulGraphGetCall();
      when(mockRequest.filter).calledWith(filterStr).mockReturnValueOnce(mockRequest);

      await graphService.get<string>({ path, filter: filterStr });

      expect(mockRequest.expand).toHaveBeenCalledTimes(0);
    });

    it('chains input parameters as api methods and returns the response', async () => {
      mockSuccessfulGraphApiCall();
      mockSuccessfulGraphGetCall();
      when(mockRequest.filter).calledWith(filterStr).mockReturnValueOnce(mockRequest);
      when(mockRequest.expand).calledWith(expandStr).mockReturnValueOnce(mockRequest);

      const result = await graphService.get<string>({ path, filter: filterStr, expand: expandStr });

      expect(mockClient.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.filter).toHaveBeenCalledTimes(1);
      expect(mockRequest.expand).toHaveBeenCalledTimes(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      expect(mockClient.api).toHaveBeenCalledWith(path);
      expect(mockRequest.filter).toHaveBeenCalledWith(filterStr);
      expect(mockRequest.expand).toHaveBeenCalledWith(expandStr);
      expect(mockRequest.get).toHaveBeenCalledWith();

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('post', () => {
    withCommonGraphExceptionHandlingTests({
      mockSuccessfulGraphApiCall: () => mockSuccessfulGraphApiCall(),
      mockGraphEndpointToErrorWith: (error: unknown) => when(mockRequest.post).calledWith(requestBody).mockRejectedValue(error),
      makeRequest: () => graphService.post({ path, requestBody }),
    });

    it('calls the correct graph client methods on a graph service get request and returns the response', async () => {
      mockSuccessfulGraphApiCall();
      mockSuccessfulGraphPostCall();

      const result = await graphService.post<string>({ path, requestBody });

      expect(mockClient.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.post).toHaveBeenCalledTimes(1);

      expect(mockClient.api).toHaveBeenCalledWith(path);
      expect(mockRequest.post).toHaveBeenCalledWith(requestBody);

      expect(result).toEqual(expectedPostResponse);
    });
  });

  const mockSuccessfulGraphApiCall = () => when(mockClient.api).calledWith(path).mockReturnValueOnce(mockRequest);
  const mockSuccessfulGraphGetCall = () => when(mockRequest.get).calledWith().mockResolvedValue(expectedResponse);
  const mockSuccessfulGraphPostCall = () => when(mockRequest.post).calledWith(requestBody).mockResolvedValue(expectedPostResponse);
});
