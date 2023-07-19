import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';

import { getCallExpectations } from './call-expectations-test-parts';

export const withGetMethodTests = ({
  mockGraphClientService,
  path,
  filterString,
  expandString,
  getResponse,
  methodResponse,
  makeRequest,
}: {
  mockGraphClientService: MockGraphClientService;
  path: string;
  filterString?: string;
  expandString?: string;
  getResponse: unknown;
  methodResponse?: unknown;
  makeRequest: () => Promise<unknown>;
}) => {
  it('returns the expected response', async () => {
    mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path);

    if (filterString) {
      mockGraphClientService.mockSuccessfulFilterCallWithFilterString(filterString);
    }

    if (expandString) {
      mockGraphClientService.mockSuccessfulExpandCallWithExpandString(expandString);
    }

    mockGraphClientService.mockSuccessfulGraphGetCall(getResponse);

    const result = await makeRequest();

    const expectations = getCallExpectations({
      mockGraphClientService,
      apiCalledWith: path,
      filterCalledWith: filterString,
      expandCalledWith: expandString,
      getCalled: true,
    });
    expectations.forEach((expectation) => expectation());

    expect(result).toEqual(methodResponse !== null && methodResponse !== void 0 ? methodResponse : getResponse);
  });
};
