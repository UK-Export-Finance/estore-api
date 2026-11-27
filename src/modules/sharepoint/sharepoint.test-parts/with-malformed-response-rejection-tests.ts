import { GraphService } from '@ukef/modules/graph/graph.service';
import { SharepointConfigType } from '@ukef/config/sharepoint.config';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { resetAllWhenMocks, when } from 'jest-when';

export const withMalformedResponseRejectionTests = ({
  sharepointConfig,
  path,
  filterString,
  expandString,
  makeRequest,
}: {
  sharepointConfig: SharepointConfigType;
  path: string;
  filterString: string;
  expandString: string;
  makeRequest: (sharepointService: SharepointService) => Promise<unknown>;
}) => {
  let graphServiceGet: jest.Mock;
  let sharepointService: SharepointService;

  beforeEach(() => {
    graphServiceGet = jest.fn() as jest.Mock;
    const mockGraphClientService = { client: {} };
    const graphService = new GraphService(mockGraphClientService as any);
    graphService.get = graphServiceGet as unknown as (typeof graphService)['get'];

    sharepointService = new SharepointService(graphService, sharepointConfig);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  it('throws an error when the response is undefined', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce(undefined);

    await expect(makeRequest(sharepointService)).rejects.toThrow('Graph API returned malformed response: expected { value: [] }, got undefined');
  });

  it('throws an error when the response is null', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce(null);

    await expect(makeRequest(sharepointService)).rejects.toThrow('Graph API returned malformed response: expected { value: [] }, got null');
  });

  it('throws an error when the response is an empty object', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce({});

    await expect(makeRequest(sharepointService)).rejects.toThrow('Graph API returned malformed response: expected { value: [] }, got {}');
  });

  it('throws an error when the response value is missing', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce({ otherField: 'value' });

    await expect(makeRequest(sharepointService)).rejects.toThrow('Graph API returned malformed response: expected { value: [] }, got {"otherField":"value"}');
  });

  it('throws an error when the response value is not an array', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce({ value: 'not an array' });

    await expect(makeRequest(sharepointService)).rejects.toThrow('Graph API returned malformed response: expected { value: [] }, got {"value":"not an array"}');
  });

  it('throws an error when the response value is an object instead of array', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce({ value: { nested: 'object' } });

    await expect(makeRequest(sharepointService)).rejects.toThrow(
      'Graph API returned malformed response: expected { value: [] }, got {"value":{"nested":"object"}}',
    );
  });

  it('succeeds when the response value is an empty array', async () => {
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce({ value: [] });

    const result = await makeRequest(sharepointService);

    expect(result).toEqual([]);
  });

  it('succeeds when the response value is a populated array', async () => {
    const item1 = { id: '1', title: 'Item 1' };
    const item2 = { id: '2', title: 'Item 2' };
    when(graphServiceGet)
      .calledWith({
        path,
        filter: filterString,
        expand: expandString,
        top: undefined,
      })
      .mockResolvedValueOnce({ value: [item1, item2] });

    const result = await makeRequest(sharepointService);

    expect(result).toEqual([item1, item2]);
  });
};
