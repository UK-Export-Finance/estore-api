import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { Api } from '@ukef-test/support/api';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UploadFileInDealFolderGenerator } from '@ukef-test/support/generator/upload-file-in-deal-folder-generator';
import { MockDtfsStorageClientService } from '@ukef-test/support/mocks/dtfs-storage-client.service.mock';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

describe('postDocumentInDealFolder', () => {
  const valueGenerator = new RandomValueGenerator();
  const {
    uploadFileInDealFolderRequest,
    uploadFileInDealFolderResponse,
    uploadFileInDealFolderParams,
    fileSizeInBytes,
    downloadFileResponse,
    getSharepointSiteIdPath,
    getSharepointSiteIdResponse,
    getDriveIdPath,
    getDriveIdResponse,
    getUploadSessionArgs,
    uploadSession,
    getUploadTaskArgs,
    getListIdPath,
    getListIdResponse,
    getItemIdPath,
    getItemIdResponse,
    updateFileInfoPath,
    updateFileInfoRequest,
  } = new UploadFileInDealFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });
  const [{ fileName, fileLocationPath }] = uploadFileInDealFolderRequest;
  const { siteId, dealId } = uploadFileInDealFolderParams;

  let api: Api;
  let mockGraphClientService: MockGraphClientService;
  let mockDtfsStorageClientService: MockDtfsStorageClientService;

  beforeAll(async () => {
    ({ api, mockGraphClientService, mockDtfsStorageClientService } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterAll(async () => {
    await api.destroy();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockSuccessfulCompleteRequest();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(getPostDocumentUrl(siteId, dealId), uploadFileInDealFolderRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  it('returns the path to the uploaded file with status code 201 when successful', async () => {
    mockSuccessfulCompleteRequest();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(uploadFileInDealFolderResponse);
  });

  const makeRequestWithBody = (requestBody: unknown[]) => api.post(getPostDocumentUrl(siteId, dealId), requestBody);

  const makeRequest = () => makeRequestWithBody(uploadFileInDealFolderRequest);

  const mockSuccessfulCompleteRequest = () => {
    mockDtfsStorageClientService
      // request to get file properties
      .mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath)
      .mockSuccessfulGetPropertiesCall(fileSizeInBytes)
      // request to download file
      .mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath)
      .mockSuccessfulDownloadCall(downloadFileResponse);
    mockGraphClientService
      // request to get sharepoint site id
      .mockSuccessfulGraphApiCallWithPath(getSharepointSiteIdPath)
      .mockSuccessfulGraphGetCall(getSharepointSiteIdResponse);
    mockGraphClientService
      // request to get drive id
      .mockSuccessfulGraphApiCallWithPath(getDriveIdPath)
      .mockSuccessfulGraphGetCall(getDriveIdResponse);
    mockGraphClientService
      // request to upload file
      .mockSuccessfulGetFileUploadSessionCall(...getUploadSessionArgs, uploadSession)
      .mockSuccessfulGetFileUploadTaskCall(...getUploadTaskArgs)
      .mockSuccessfulUploadCall();
    mockGraphClientService
      // request to get list id
      .mockSuccessfulGraphApiCallWithPath(getListIdPath)
      .mockSuccessfulGraphGetCall(getListIdResponse);
    mockGraphClientService
      // request to get item id
      .mockSuccessfulGraphApiCallWithPath(getItemIdPath)
      .mockSuccessfulGraphGetCall(getItemIdResponse);
    mockGraphClientService
      // request to update file information
      .mockSuccessfulGraphApiCallWithPath(updateFileInfoPath)
      .mockSuccessfulGraphPatchCallWithRequestBody(updateFileInfoRequest);
  };

  const getPostDocumentUrl = (siteId: string, dealId: string) => {
    return `/api/v1/sites/${siteId}/deals/${dealId}/documents`;
  };
});
