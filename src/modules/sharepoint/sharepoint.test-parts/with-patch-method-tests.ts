import { SharepointConfigType } from '@ukef/config/sharepoint.config';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { resetAllWhenMocks, when } from 'jest-when';

export const withPatchMethodTests = ({
  sharepointConfig,
  path,
  requestBody,
  graphServiceResponse,
  methodResponse,
  makeRequest,
}: {
  sharepointConfig: SharepointConfigType;
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
