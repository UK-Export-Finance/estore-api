import { Test, TestingModule } from '@nestjs/testing';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { getMockGraph2ClientService } from '@ukef-test/support/graph-client.service.mock';
import { when } from 'jest-when';

import GraphClientService from '../graph-client/graph-client.service';
import GraphService from './graph.service';
import { withCommonGraphExceptionHandlingTests } from './graph.test-parts/with-common-graph-exception-handling-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const path = valueGenerator.string();
  const filterStr = valueGenerator.string();
  const expandStr = valueGenerator.string();
  const expectedResponse = valueGenerator.string();
  const { mockGraphClientService, mockRequest } = getMockGraph2ClientService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [GraphService, { provide: GraphClientService, useValue: mockGraphClientService }],
    }).compile();

    graphService = moduleFixture.get(GraphService);

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

      expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path);
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

      expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.filter).toHaveBeenCalledTimes(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path);
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

      expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1);
      expect(mockRequest.filter).toHaveBeenCalledTimes(1);
      expect(mockRequest.expand).toHaveBeenCalledTimes(1);
      expect(mockRequest.get).toHaveBeenCalledTimes(1);

      expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path);
      expect(mockRequest.filter).toHaveBeenCalledWith(filterStr);
      expect(mockRequest.expand).toHaveBeenCalledWith(expandStr);
      expect(mockRequest.get).toHaveBeenCalledWith();

      expect(result).toEqual(expectedResponse);
    });
  });

  const mockSuccessfulGraphApiCall = () => when(mockGraphClientService.client.api).calledWith(path).mockReturnValueOnce(mockRequest);
  const mockSuccessfulGraphGetCall = () => when(mockRequest.get).calledWith().mockResolvedValue(expectedResponse);
});
