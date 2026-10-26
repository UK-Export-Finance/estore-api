import { SharepointConfigType } from '@ukef/config/sharepoint.config';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { resetAllWhenMocks, when } from 'jest-when';

export const withPostMethodTests = ({
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
  let graphServicePost: jest.Mock;
  let sharepointService: SharepointService;

  beforeEach(() => {
    graphServicePost = jest.fn();
    const graphService = new GraphService(null);
    graphService.post = graphServicePost;

    sharepointService = new SharepointService(graphService, sharepointConfig);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });
  it('returns the expected response and calls Graph Service with the expected parameters', async () => {
    when(graphServicePost)
      .calledWith({
        path,
        requestBody,
      })
      .mockResolvedValueOnce(graphServiceResponse);

    const result = await makeRequest(sharepointService);

    expect(graphServicePost).toHaveBeenCalledTimes(1);
    expect(graphServicePost).toHaveBeenCalledWith({
      path,
      requestBody,
    });

    if (methodResponse) {
      expect(result).toEqual(methodResponse);
    }
  });
};
