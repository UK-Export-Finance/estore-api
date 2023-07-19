import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';

export const getCallExpectations = ({
  mockGraphClientService,
  apiCalledWith,
  filterCalledWith,
  expandCalledWith,
  getCalled = false,
  postCalled = false,
  postCalledWith,
}: {
  mockGraphClientService: MockGraphClientService;
  apiCalledWith?: string;
  filterCalledWith?: string;
  expandCalledWith?: string;
  getCalled?: boolean;
  postCalled?: boolean;
  postCalledWith?: unknown;
}) => {
  const mockRequest = mockGraphClientService.getApiRequestObject();
  const apiCallExpectations = apiCalledWith
    ? [
        () => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1),
        () => expect(mockGraphClientService.client.api).toHaveBeenCalledWith(apiCalledWith),
      ]
    : [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(0)];

  const filterCallExpectations = filterCalledWith
    ? [() => expect(mockRequest.filter).toHaveBeenCalledTimes(1), () => expect(mockRequest.filter).toHaveBeenCalledWith(filterCalledWith)]
    : [() => expect(mockRequest.filter).toHaveBeenCalledTimes(0)];

  const expandCallExpectations = expandCalledWith
    ? [() => expect(mockRequest.expand).toHaveBeenCalledTimes(1), () => expect(mockRequest.expand).toHaveBeenCalledWith(expandCalledWith)]
    : [() => expect(mockRequest.expand).toHaveBeenCalledTimes(0)];

  const getCallExpectations = getCalled
    ? [() => expect(mockRequest.get).toHaveBeenCalledTimes(1), () => expect(mockRequest.get).toHaveBeenCalledWith()]
    : [() => expect(mockRequest.get).toHaveBeenCalledTimes(0)];

  // TODO apim-472 tidy issue with postCalledWith
  const postCallExpectations =
    postCalled || postCalledWith
      ? [() => expect(mockRequest.post).toHaveBeenCalledTimes(1), () => expect(mockRequest.post).toHaveBeenCalledWith(postCalledWith)]
      : [() => expect(mockRequest.post).toHaveBeenCalledTimes(0)];

  return [...apiCallExpectations, ...filterCallExpectations, ...expandCallExpectations, ...getCallExpectations, ...postCallExpectations];
};
