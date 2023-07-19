import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { getCallExpectations } from './call-expectations-test-parts';

export const withPostMethodTests = ({
  mockGraphClientService,
  path,
  requestBody,
  postResponse,
  methodResponse,
  makeRequest,
}: {
  mockGraphClientService: MockGraphClientService;
  path: string;
  requestBody?: unknown;
  postResponse: unknown;
  methodResponse?: unknown;
  makeRequest: () => Promise<unknown>;
}) => {
  it('returns the expected response', async () => {
    mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockSuccessfulGraphPostCallWithRequestBody(requestBody, postResponse);

    const result = await makeRequest();

    const expectations = getCallExpectations({
        mockGraphClientService,
        apiCalledWith: path,
        postCalledWith: requestBody,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(methodResponse);
  });
};
