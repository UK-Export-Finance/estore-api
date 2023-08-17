import { GraphError } from '@microsoft/microsoft-graph-client';
import { UploadFileInDealFolderExistsException } from '@ukef/modules/deal-folder/exception/upload-file-in-deal-folder-exists.exception';
import { TermsFacilityExistsException } from '@ukef/modules/terms/exception/terms-facility-exists.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService, MockGraphRequest } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';
import { Readable } from 'stream';

import GraphService from './graph.service';
import { withSharedGraphExceptionHandlingTests } from './graph.test-parts/with-shared-graph-exception-handling-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const path = valueGenerator.string();
  const filterStr = valueGenerator.string();
  const expandStr = valueGenerator.string();
  const orderByStr = valueGenerator.string();
  const expectedResponse = valueGenerator.string();

  const mockGraphClientService = new MockGraphClientService();

  const requestBody = {
    exporterName: valueGenerator.string(),
  };
  const expectedPostResponse = valueGenerator.string();
  const expectedPatchResponse = valueGenerator.string();

  const file = Readable.from([valueGenerator.string()]) as NodeJS.ReadableStream;
  const fileSizeInBytes = valueGenerator.nonnegativeInteger();
  const fileName = valueGenerator.fileName();
  const urlToCreateUploadSession = valueGenerator.httpsUrl();
  const expectedUploadSessionHeaders = { item: { '@microsoft.graph.conflictBehavior': 'fail' } };
  const uploadSession = {
    url: valueGenerator.httpsUrl(),
    expiry: valueGenerator.date(),
  };
  const expectedUploadTaskOptions = { rangeSize: fileSizeInBytes };

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService);
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('get', () => {
    withSharedGraphExceptionHandlingTests({
      mockGraphEndpointToErrorWith: (error: unknown) => mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphGetCall(error),
      makeRequest: () => graphService.get({ path }),
    });

    it('calls the correct graph client methods on a graph service get request with no additional parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        filterCalled: false,
        expandCalled: false,
        orderbyCalled: false,
        getCalled: true,
      });

      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls the correct graph client methods on a graph service get request with one additional parameter and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        filterCalled: true,
        expandCalled: false,
        orderbyCalled: false,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls all graph client methods on a graph service get request with multiple parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr, expand: expandStr });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        filterCalled: true,
        expandCalled: true,
        orderbyCalled: false,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });

    it('calls all graph client methods on a graph service get request with orderby parameter and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphRequest();

      const result = await graphService.get<string>({ path, filter: filterStr, expand: expandStr, orderBy: orderByStr });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        filterCalled: true,
        expandCalled: true,
        orderbyCalled: true,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });
  });

  describe('post', () => {
    withSharedGraphExceptionHandlingTests({
      mockGraphEndpointToErrorWith: (error: unknown) =>
        mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphPostCallWithRequestBody(requestBody, error),
      makeRequest: () => graphService.post({ path, requestBody }),
    });

    it('calls the correct graph client methods on a graph service post request with no additional parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphPostRequest();

      const result = await graphService.post<string>({ path, requestBody });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        postCalled: true,
      });
      expectations.forEach((expectation) => expectation(requestBody));

      expect(result).toEqual(expectedPostResponse);
    });

    it(`throws a TermsFacilityExistsException if SharePoint responds with a 400 response containing 'One or more fields with unique constraints already has the provided value'`, async () => {
      const graphError = new GraphError(400, 'One or more fields with unique constraints already has the provided value.');
      graphError.code = 'invalidRequest';

      mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphPostCallWithRequestBody(requestBody, graphError);

      const graphServicePromise = graphService.post<string>({ path, requestBody });

      await expect(graphServicePromise).rejects.toBeInstanceOf(TermsFacilityExistsException);
      await expect(graphServicePromise).rejects.toThrow('Facility Term item with this identifier already exists.');
      await expect(graphServicePromise).rejects.toHaveProperty('innerError', graphError);
    });
  });

  describe('patch', () => {
    withSharedGraphExceptionHandlingTests({
      mockGraphEndpointToErrorWith: (error: unknown) =>
        mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path).mockUnsuccessfulGraphPatchCallWithRequestBody(requestBody, error),
      makeRequest: () => graphService.patch({ path, requestBody }),
    });

    it('calls the correct graph client methods on a graph service patch request with no additional parameters and returns the response', async () => {
      const request = mockSuccessfulCompleteGraphPatchRequest();

      const result = await graphService.patch<unknown, string>({ path, requestBody });

      const expectations = getCallExpectations(request, {
        apiCalled: true,
        patchCalled: true,
      });
      expectations.forEach((expectation) => expectation(requestBody));

      expect(result).toEqual(expectedPatchResponse);
    });
  });

  describe('uploadFile', () => {
    withSharedGraphExceptionHandlingTests({
      mockGraphEndpointToErrorWith: (error: unknown) => mockUnsuccessfulFileUpload(error),
      makeRequest: () => graphService.uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession }),
    });

    it('calls the correct graph client methods on a graph service upload file call and returns the response', async () => {
      mockSuccessfulCompleteGraphUploadFileCall();

      const result = await graphService.uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession });

      expect(mockGraphClientService.getFileUploadSession).toHaveBeenCalledTimes(1);
      expect(mockGraphClientService.getFileUploadSession).toHaveBeenCalledWith(urlToCreateUploadSession, expectedUploadSessionHeaders);
      expect(mockGraphClientService.getFileUploadTask).toHaveBeenCalledTimes(1);
      expect(mockGraphClientService.getFileUploadTask).toHaveBeenCalledWith(
        expect.any(Readable),
        fileName,
        fileSizeInBytes,
        uploadSession,
        expectedUploadTaskOptions,
      );
      expect(mockGraphClientService.mockFileUploadTask.upload).toHaveBeenCalledTimes(1);
      expect(mockGraphClientService.mockFileUploadTask.upload).toHaveBeenCalledWith();

      expect(result).toEqual({});
    });

    it(`throws an UploadFileInDealFolderExistsException if SharePoint responds with a 409 response containing 'The specified item name already exists'`, async () => {
      const graphError = new GraphError(409, 'The specified item name already exists');
      graphError.code = 'nameAlreadyExists';

      mockUnsuccessfulFileUpload(graphError);

      const graphServicePromise = graphService.uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession });

      await expect(graphServicePromise).rejects.toBeInstanceOf(UploadFileInDealFolderExistsException);
      await expect(graphServicePromise).rejects.toThrow(`A file with the name ${fileName} already exists for the buyer name and deal ID specified.`);
      await expect(graphServicePromise).rejects.toHaveProperty('innerError', graphError);
    });
  });

  const mockSuccessfulCompleteGraphRequest = () =>
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expandStr)
      .mockSuccessfulFilterCallWithFilterString(filterStr)
      .mockSuccessfulGraphGetCall(expectedResponse);

  const mockSuccessfulCompleteGraphPostRequest = () =>
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expandStr)
      .mockSuccessfulFilterCallWithFilterString(filterStr)
      .mockSuccessfulGraphPostCallWithRequestBody(requestBody, expectedPostResponse);

  const mockSuccessfulCompleteGraphPatchRequest = () =>
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expandStr)
      .mockSuccessfulFilterCallWithFilterString(filterStr)
      .mockSuccessfulGraphPatchCallWithRequestBody(requestBody, expectedPatchResponse);

  const mockSuccessfulCompleteGraphUploadFileCall = () =>
    mockGraphClientService
      .mockSuccessfulGetFileUploadSessionCall(urlToCreateUploadSession, expectedUploadSessionHeaders, uploadSession)
      .mockSuccessfulGetFileUploadTaskCall(fileName, fileSizeInBytes, uploadSession, expectedUploadTaskOptions)
      .mockSuccessfulUploadCall();

  const mockUnsuccessfulFileUpload = (error: unknown) =>
    mockGraphClientService
      .mockSuccessfulGetFileUploadSessionCall(urlToCreateUploadSession, expectedUploadSessionHeaders, uploadSession)
      .mockSuccessfulGetFileUploadTaskCall(fileName, fileSizeInBytes, uploadSession, expectedUploadTaskOptions)
      .mockUnsuccessfulUploadCall(error);

  const getCallExpectations = (
    request: MockGraphRequest,
    {
      apiCalled = false,
      filterCalled = false,
      expandCalled = false,
      orderbyCalled = false,
      getCalled = false,
      postCalled = false,
      patchCalled = false,
    }: {
      apiCalled?: boolean;
      filterCalled?: boolean;
      expandCalled?: boolean;
      orderbyCalled?: boolean;
      getCalled?: boolean;
      postCalled?: boolean;
      patchCalled?: boolean;
    },
  ) => {
    const apiCallExpectations = apiCalled
      ? [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(1), () => expect(mockGraphClientService.client.api).toHaveBeenCalledWith(path)]
      : [() => expect(mockGraphClientService.client.api).toHaveBeenCalledTimes(0)];

    const filterCallExpectations = filterCalled
      ? [() => expect(request.filter).toHaveBeenCalledTimes(1), () => expect(request.filter).toHaveBeenCalledWith(filterStr)]
      : [() => expect(request.filter).toHaveBeenCalledTimes(0)];

    const expandCallExpectations = expandCalled
      ? [() => expect(request.expand).toHaveBeenCalledTimes(1), () => expect(request.expand).toHaveBeenCalledWith(expandStr)]
      : [() => expect(request.expand).toHaveBeenCalledTimes(0)];

    const orderbyCallExpectations = orderbyCalled
      ? [() => expect(request.orderby).toHaveBeenCalledTimes(1), () => expect(request.orderby).toHaveBeenCalledWith(orderByStr)]
      : [() => expect(request.orderby).toHaveBeenCalledTimes(0)];

    const getCallExpectations = getCalled
      ? [() => expect(request.get).toHaveBeenCalledTimes(1), () => expect(request.get).toHaveBeenCalledWith()]
      : [() => expect(request.get).toHaveBeenCalledTimes(0)];

    const postCallExpectations = postCalled
      ? [() => expect(request.post).toHaveBeenCalledTimes(1), (requestBody?) => expect(request.post).toHaveBeenCalledWith(requestBody)]
      : [() => expect(request.post).toHaveBeenCalledTimes(0)];

    const patchCallExpectations = patchCalled
      ? [() => expect(request.patch).toHaveBeenCalledTimes(1), (requestBody?) => expect(request.patch).toHaveBeenCalledWith(requestBody)]
      : [() => expect(request.patch).toHaveBeenCalledTimes(0)];

    return [
      ...apiCallExpectations,
      ...filterCallExpectations,
      ...expandCallExpectations,
      ...orderbyCallExpectations,
      ...getCallExpectations,
      ...postCallExpectations,
      ...patchCallExpectations,
    ];
  };
});
