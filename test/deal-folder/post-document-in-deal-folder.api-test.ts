import { BUYER_NAME, ENUMS, FILE_LOCATION_PATH, SHAREPOINT } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { UploadFileInDealFolderParamsDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-params.dto';
import { UploadFileInDealFolderRequestDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-request.dto';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { withDealIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/deal-id-param-validation-api-tests';
import { withSiteIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/site-id-param-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UploadFileInDealFolderGenerator } from '@ukef-test/support/generator/upload-file-in-deal-folder-generator';
import { MockDtfsStorageClientService } from '@ukef-test/support/mocks/dtfs-storage-client.service.mock';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

describe('postDocumentInDealFolder', () => {
  const successStatusCode = 201;
  const valueGenerator = new RandomValueGenerator();
  const uploadFileInDealFolderGenerator = new UploadFileInDealFolderGenerator(valueGenerator);
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
  } = uploadFileInDealFolderGenerator.generate({ numberToGenerate: 1 });
  const [{ buyerName, fileName, fileLocationPath }] = uploadFileInDealFolderRequest;
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

  describe('happy path', () => {
    it('returns the path to the uploaded file with status code 201 when successful', async () => {
      mockSuccessfulCompleteRequest();

      const { status, body } = await makeRequest();

      expect(status).toBe(201);
      expect(body).toEqual(uploadFileInDealFolderResponse);
    });
  });

  // describe('unhappy paths', () => {

  // });

  describe('param validation', () => {
    withSiteIdParamValidationApiTests({
      valueGenerator,
      validRequestParam: siteId,
      makeRequest: (siteId) => makeRequestWithParamsAndMockReturningItemId({ siteId, dealId }),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
      successStatusCode,
    });

    withDealIdParamValidationApiTests({
      valueGenerator,
      validRequestParam: dealId,
      makeRequest: (dealId) => makeRequestWithParamsAndMockReturningItemId({ siteId, dealId }),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
      successStatusCode,
    });
  });

  describe('field validation', () => {
    withStringFieldValidationApiTests({
      fieldName: 'buyerName',
      minLength: 1,
      maxLength: 250,
      generateFieldValueOfLength: (length: number) => valueGenerator.buyerName({ length }),
      pattern: BUYER_NAME.REGEX,
      generateFieldValueThatDoesNotMatchRegex: () => ' Example Buyer',
      validRequestBody: uploadFileInDealFolderRequest,
      successStatusCode,
      makeRequest: (requestBody: unknown[]) => makeRequestWithBodyAndMockReturningItemId(requestBody as UploadFileInDealFolderRequestDto),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
    });

    withStringFieldValidationApiTests({
      fieldName: 'buyerName',
      minLength: 1,
      maxLength: 250,
      generateFieldValueOfLength: (length: number) => valueGenerator.buyerName({ length }),
      pattern: BUYER_NAME.REGEX,
      generateFieldValueThatDoesNotMatchRegex: () => ' Example Buyer',
      validRequestBody: uploadFileInDealFolderRequest,
      successStatusCode,
      makeRequest: (requestBody: unknown[]) => makeRequestWithBodyAndMockReturningItemId(requestBody as UploadFileInDealFolderRequestDto),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
    });

    withStringFieldValidationApiTests({
      fieldName: 'documentType',
      enum: ENUMS.DOCUMENT_TYPES,
      generateFieldValueOfLength: () => valueGenerator.enumValue<DocumentTypeEnum>(ENUMS.DOCUMENT_TYPES),
      generateFieldValueThatDoesNotMatchEnum: () => 'invalidDocumentType' as DocumentTypeEnum,
      validRequestBody: uploadFileInDealFolderRequest,
      successStatusCode,
      makeRequest: (requestBody: unknown[]) => makeRequestWithBodyAndMockReturningItemId(requestBody as UploadFileInDealFolderRequestDto),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
    });

    withStringFieldValidationApiTests({
      fieldName: 'fileName',
      minLength: 5,
      maxLength: 250,
      generateFieldValueOfLength: (length: number) => valueGenerator.fileName({ length: length }),
      pattern: SHAREPOINT.DOCUMENT_FILE_NAME.REGEX,
      generateFieldValueThatDoesNotMatchRegex: () => 'file.exe',
      validRequestBody: uploadFileInDealFolderRequest,
      successStatusCode,
      makeRequest: (requestBody: unknown[]) => makeRequestWithBodyAndMockReturningItemId(requestBody as UploadFileInDealFolderRequestDto),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
    });

    withStringFieldValidationApiTests({
      fieldName: 'fileLocationPath',
      minLength: 1,
      maxLength: 250,
      generateFieldValueOfLength: (length: number) => valueGenerator.fileLocationPath({ length }),
      pattern: FILE_LOCATION_PATH.REGEX,
      generateFieldValueThatDoesNotMatchRegex: () => '?',
      validRequestBody: uploadFileInDealFolderRequest,
      successStatusCode,
      makeRequest: (requestBody: unknown[]) => makeRequestWithBodyAndMockReturningItemId(requestBody as UploadFileInDealFolderRequestDto),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestWouldSucceedUpToReturningItem(),
    });
  });

  const getPostDocumentUrl = (siteId: string, dealId: string) => `/api/v1/sites/${siteId}/deals/${dealId}/documents`;

  const makeRequestWithBody = (requestBody: UploadFileInDealFolderRequestDto) => api.post(getPostDocumentUrl(siteId, dealId), requestBody);

  const makeRequest = () => makeRequestWithBody(uploadFileInDealFolderRequest);

  const makeRequestWithBodyAndMockReturningItemId = (requestBody: UploadFileInDealFolderRequestDto) => {
    const [{ buyerName, fileName }] = requestBody;
    mockReturningItem(siteId, dealId, buyerName, fileName);
    return makeRequestWithBody(requestBody);
  };

  const makeRequestWithParamsAndMockReturningItemId = (requestParams: UploadFileInDealFolderParamsDto) => {
    const { siteId, dealId } = requestParams;
    mockReturningItem(siteId, dealId, buyerName, fileName);
    return api.post(getPostDocumentUrl(siteId, dealId), uploadFileInDealFolderRequest);
  };

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
      .mockSuccessfulGraphGetCall(getSharepointSiteIdResponse)
      // request to get drive id
      .mockSuccessfulGraphApiCallWithPath(getDriveIdPath)
      .mockSuccessfulGraphGetCall(getDriveIdResponse)
      // request to upload file
      .mockSuccessfulGetFileUploadSessionCall(...getUploadSessionArgs, uploadSession)
      .mockSuccessfulGetFileUploadTaskCall(...getUploadTaskArgs)
      .mockSuccessfulUploadCall()
      // request to get list id
      .mockSuccessfulGraphApiCallWithPath(getListIdPath)
      .mockSuccessfulGraphGetCall(getListIdResponse)
      // request to get item id
      .mockSuccessfulGraphApiCallWithPath(getItemIdPath)
      .mockSuccessfulGraphGetCall(getItemIdResponse)
      // request to update file information
      .mockSuccessfulGraphApiCallWithPath(updateFileInfoPath)
      .mockSuccessfulGraphPatchCallWithRequestBody(updateFileInfoRequest);
  };

  const givenAnyRequestWouldSucceedUpToReturningItem = () => {
    mockDtfsStorageClientService
      // request to get file properties
      .mockSuccessfulGetShareFileClientCall(expect.any(String), expect.any(String))
      .mockSuccessfulGetPropertiesCall(fileSizeInBytes)
      // request to download file
      .mockSuccessfulGetShareFileClientCall(expect.any(String), expect.any(String))
      .mockSuccessfulDownloadCall(downloadFileResponse);
    mockGraphClientService
      // request to get sharepoint site id
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      .mockSuccessfulGraphGetCall(getSharepointSiteIdResponse)
      // request to get drive id
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      .mockSuccessfulGraphGetCall(getDriveIdResponse)
      // request to upload file
      .mockSuccessfulGetFileUploadSessionCall(expect.any(String), expect.any(Object), uploadSession)
      .mockSuccessfulGetFileUploadTaskCall(expect.any(String), getUploadTaskArgs[1], getUploadTaskArgs[2], getUploadTaskArgs[3])
      .mockSuccessfulUploadCall()
      // request to get list id
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      .mockSuccessfulGraphGetCall(getListIdResponse)
      // first part of request to get item id (does not return item)
      .mockSuccessfulGraphApiCallWithPath(expect.any(String));
  };

  const mockReturningItem = (siteId: string, dealId: string, buyerName: string, fileName: string): void => {
    const itemWebUrl = uploadFileInDealFolderGenerator.constructWebUrlForItem(siteId, dealId, buyerName, fileName);

    const itemId = getItemIdResponse.value[0].id;

    mockGraphClientService
      // returning item
      .mockSuccessfulGraphGetCall({ value: [{ webUrl: itemWebUrl, id: itemId }] })
      // request to update file information
      .mockSuccessfulGraphApiCallWithPath(expect.anything())
      .mockSuccessfulGraphPatchCallWithRequestBody(expect.any(Object));
  };
});
