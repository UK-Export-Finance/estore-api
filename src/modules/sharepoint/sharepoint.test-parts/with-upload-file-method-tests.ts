import { SharepointConfigType } from '@ukef/config/sharepoint.config';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { resetAllWhenMocks, when } from 'jest-when';

export const withUploadFileMethodTests = ({
  sharepointConfig,
  requestBody,
  graphServiceResponse,
  methodResponse,
  makeRequest,
}: {
  sharepointConfig: SharepointConfigType;
  requestBody?: unknown;
  graphServiceResponse: unknown;
  methodResponse?: unknown;
  makeRequest: (sharepointService: SharepointService) => Promise<unknown>;
}) => {
  let graphServiceUploadFile: jest.Mock;
  let sharepointService: SharepointService;

  beforeEach(() => {
    graphServiceUploadFile = jest.fn();
    const graphService = new GraphService(null);
    graphService.uploadFile = graphServiceUploadFile;

    sharepointService = new SharepointService(graphService, sharepointConfig);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });
  it('returns the expected response and calls Graph Service with the expected parameters', async () => {
    when(graphServiceUploadFile).calledWith(requestBody).mockResolvedValueOnce(graphServiceResponse);

    const result = await makeRequest(sharepointService);

    expect(graphServiceUploadFile).toHaveBeenCalledTimes(1);
    expect(graphServiceUploadFile).toHaveBeenCalledWith(requestBody);

    if (methodResponse) {
      expect(result).toEqual(methodResponse);
    }
  });
};
