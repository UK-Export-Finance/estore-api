import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { SharepointConfig } from '@ukef/config/sharepoint.config';
import GraphService from '@ukef/modules/graph/graph.service';
import { resetAllWhenMocks, when } from 'jest-when';

import { getCallExpectations } from '../../graph/graph.test-parts/call-expectations-test-parts';
import { SharepointService } from '../sharepoint.service';

export const withGetMethodTests = ({
  sharepointConfig,
  path,
  filterString,
  expandString,
  graphServiceResponse,
  methodResponse,
  makeRequest,
}: {
  sharepointConfig: SharepointConfig;
  path: string;
  filterString?: string;
  expandString?: string;
  graphServiceResponse: unknown;
  methodResponse?: unknown;
  makeRequest: (sharepointService: SharepointService) => Promise<unknown>;
}) => {
  let graphServiceGet: jest.Mock;
  let sharepointService: SharepointService;

  beforeEach(() => {
    graphServiceGet = jest.fn();
    const graphService = new GraphService(null);
    graphService.get = graphServiceGet;

    sharepointService = new SharepointService(graphService, sharepointConfig);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });
  it('returns the expected response and calls Graph Service with the expected parameters', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
      })
      .mockResolvedValueOnce(graphServiceResponse);

    const result = await makeRequest(sharepointService);

    expect(graphServiceGet).toHaveBeenCalledTimes(1);
    expect(graphServiceGet).toHaveBeenCalledWith({
      path,
      filter: filterString,
      expand: expandString,
    });
    expect(result).toEqual(methodResponse);
  });
};
