import { SharepointConfig } from '@ukef/config/sharepoint.config';
import GraphService from '@ukef/modules/graph/graph.service';
import { resetAllWhenMocks, when } from 'jest-when';

import { SharepointService } from '../sharepoint.service';

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
  makeRequest: (sharepointService: SharepointService) => Promise<unknown> | void;
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
