import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { SharepointConfig } from '@ukef/config/sharepoint.config';
import GraphService from '@ukef/modules/graph/graph.service';
import { resetAllWhenMocks, when } from 'jest-when';

import { getCallExpectations } from '../../graph/graph.test-parts/call-expectations-test-parts';
import { SharepointService } from '../sharepoint.service';
import { getMockSharepointConfig } from './mock-sharepoint-config.helper';

export const withPatchMethodTests = ({
  sharepointConfig,
  path,
  requestBody,
  graphServiceResponse,
  methodResponse,
  makeRequest,
}: {
  sharepointConfig: SharepointConfig;
  path: string;
  requestBody?: unknown;
  graphServiceResponse: unknown;
  methodResponse?: unknown;
  makeRequest: (sharepointService: SharepointService) => Promise<unknown>;
}) => {
  let graphServicePatch: jest.Mock;
  let sharepointService: SharepointService;

  beforeEach(() => {
    graphServicePatch = jest.fn();
    const graphService = new GraphService(null);
    graphService.patch = graphServicePatch;

    sharepointService = new SharepointService(graphService, sharepointConfig);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });
  it('returns the expected response and calls Graph Service with the expected parameters', async () => {
    when(graphServicePatch)
      .calledWith({
        path,
        requestBody,
      })
      .mockResolvedValueOnce(graphServiceResponse);

    const result = await makeRequest(sharepointService);

    expect(graphServicePatch).toHaveBeenCalledTimes(1);
    expect(graphServicePatch).toHaveBeenCalledWith({
      path,
      requestBody,
    });
    if (methodResponse) {
      expect(result).toEqual(methodResponse);
    }
  });
};
