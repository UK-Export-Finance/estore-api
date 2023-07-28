import { RestError } from '@azure/storage-file-share';
import { GraphError } from '@microsoft/microsoft-graph-client';
import { BUYER_NAME, DTFS_MAX_FILE_SIZE_BYTES, ENUMS, FILE_LOCATION_PATH, SHAREPOINT } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { UploadFileInDealFolderParamsDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-params.dto';
import { UploadFileInDealFolderRequestDto } from '@ukef/modules/deal-folder/dto/upload-file-in-deal-folder-request.dto';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { withDealIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/deal-id-param-validation-api-tests';
import { withSiteIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/site-id-param-validation-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UploadFileInDealFolderGenerator } from '@ukef-test/support/generator/upload-file-in-deal-folder-generator';
import { MockDtfsStorageClientService } from '@ukef-test/support/mocks/dtfs-storage-client.service.mock';
import { MockGraphClientService, MockGraphRequest } from '@ukef-test/support/mocks/graph-client.service.mock';
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

  describe('happy paths', () => {
    const estoreDocumentTypeIdApplication = ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_APPLICATION;
    const estoreDocumentTypeIdFinancialStatement = ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FINANCIAL_STATEMENT;
    const estoreDocumentTypeIdBusinessInformation = ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_BUSINESS_INFORMATION;

    const documentTypeTestInputs = [
      {
        documentType: ENUMS.DOCUMENT_TYPES.EXPORTER_QUESTIONNAIRE,
        documentTitle: 'Supplementary Questionnaire',
        documentTypeId: estoreDocumentTypeIdApplication,
      },
      {
        documentType: ENUMS.DOCUMENT_TYPES.AUDITED_FINANCIAL_STATEMENTS,
        documentTitle: 'Annual Report',
        documentTypeId: estoreDocumentTypeIdFinancialStatement,
      },
      {
        documentType: ENUMS.DOCUMENT_TYPES.YEAR_TO_DATE_MANAGEMENT,
        documentTitle: 'Financial Statement',
        documentTypeId: estoreDocumentTypeIdFinancialStatement,
      },
      {
        documentType: ENUMS.DOCUMENT_TYPES.FINANCIAL_FORECASTS,
        documentTitle: 'Financial Forecast',
        documentTypeId: estoreDocumentTypeIdFinancialStatement,
      },
      {
        documentType: ENUMS.DOCUMENT_TYPES.FINANCIAL_INFORMATION_COMMENTARY,
        documentTitle: 'Financial Commentary',
        documentTypeId: estoreDocumentTypeIdFinancialStatement,
      },
      {
        documentType: ENUMS.DOCUMENT_TYPES.CORPORATE_STRUCTURE,
        documentTitle: 'Corporate Structure Diagram',
        documentTypeId: estoreDocumentTypeIdBusinessInformation,
      },
    ];

    it.each(documentTypeTestInputs)(
      'returns the path to the uploaded file with status code 201 if it is successfully uploaded when the document type is $documentType',
      async ({ documentType, documentTitle, documentTypeId }) => {
        const mockGraphRequest = mockSuccessfulCompleteRequest();

        const uploadFileInDealFolderRequestWithModifiedDocumentTypeField: UploadFileInDealFolderRequestDto = [
          { ...uploadFileInDealFolderRequest[0], documentType },
        ];

        const modifiedUpdateFileInfoRequest = {
          ...updateFileInfoRequest,
          fields: {
            ...updateFileInfoRequest.fields,
            Title: documentTitle,
            [ENVIRONMENT_VARIABLES.SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FIELD_NAME]: documentTypeId,
          },
        };

        const { status, body } = await makeRequestWithBody(uploadFileInDealFolderRequestWithModifiedDocumentTypeField);

        expect(mockGraphRequest.patch).toHaveBeenCalledWith(modifiedUpdateFileInfoRequest);
        expect(mockGraphClientService.mockFileUploadTask.upload).toHaveBeenCalledTimes(1);
        expect(status).toBe(201);
        expect(body).toEqual(uploadFileInDealFolderResponse);
      },
    );
  });

  describe('unhappy paths', () => {
    describe('error cases when getting the file size', () => {
      it('returns a 400 if the file is not found in DTFS', async () => {
        mockDtfsStorageClientService
          .mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath)
          .mockUnsuccessfulGetPropertiesCall(new RestError('', '', 404));

        const { status, body } = await makeRequest();

        expect(status).toBe(400);
        expect(body).toEqual({
          error: `File ${fileLocationPath}/${fileName} was not found in DTFS.`,
          message: 'Bad request',
          statusCode: 400,
        });
      });

      it('returns a 400 if the file size exceeds the maximum allowed in DTFS', async () => {
        mockDtfsStorageClientService
          .mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath)
          .mockSuccessfulGetPropertiesCall(DTFS_MAX_FILE_SIZE_BYTES + 1);

        const { status, body } = await makeRequest();

        expect(status).toBe(400);
        expect(body).toEqual({
          error: `The file exceeds the maximum allowed size of ${DTFS_MAX_FILE_SIZE_BYTES} bytes.`,
          message: 'Bad request',
          statusCode: 400,
        });
      });
    });

    describe('error cases when getting the SharePoint site id', () => {
      it('returns a 400 if the site is not found in SharePoint', async () => {
        const error = new GraphError(404, 'Requested site could not be found');
        error.code = 'itemNotFound';
        mockDtfsStorageClientService
          // request to get file size
          .mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath)
          .mockSuccessfulGetPropertiesCall(fileSizeInBytes)
          // request to download file
          .mockSuccessfulGetShareFileClientCall(fileName, fileLocationPath)
          .mockSuccessfulDownloadCall(downloadFileResponse);
        mockGraphClientService
          // request to get sharepoint site id
          .mockSuccessfulGraphApiCallWithPath(getSharepointSiteIdPath)
          .mockUnsuccessfulGraphGetCall(error);

        const { status, body } = await makeRequest();

        expect(status).toBe(400);
        expect(body).toEqual({
          error: `The site ID did not match any site in SharePoint.`,
          message: 'Bad request',
          statusCode: 400,
        });
      });
    });

    describe('error cases when uploading the file', () => {
      it('returns a 400 if a file with the same name already exists in the destination location in SharePoint', async () => {
        const error = new GraphError(409, 'The specified item name already exists');
        error.code = 'nameAlreadyExists';
        mockDtfsStorageClientService
          // request to get file size
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
          .mockUnsuccessfulUploadCall(error);

        const { status, body } = await makeRequest();

        expect(status).toBe(400);
        expect(body).toEqual({
          error: `A file with the name ${fileName} already exists for the buyer name and deal ID specified.`,
          message: 'Bad request',
          statusCode: 400,
        });
      });
    });
  });

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
    it('returns a 400 with validation rules if request does not meet validation rules', async () => {
      const { status, body } = await api.post(getPostDocumentUrl(siteId, dealId), [{}]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'buyerName must be a string',
          'buyerName must be longer than or equal to 1 characters',
          'buyerName must match /^(?!\\s)[\\w\\-.()\\s]+(?<![\\s.])$/ regular expression',
          'documentType must be a string',
          'documentType must be longer than or equal to 0 characters',
          'documentType must be one of the following values: Exporter_questionnaire, Audited_financial_statements, Year_to_date_management, Financial_forecasts, Financial_information_commentary, Corporate_structure',
          'fileName must be a string',
          'fileName must be longer than or equal to 5 characters',
          'fileName must match /^(?!\\s)[\\w\\-.()\\s]+.(bmp|doc|docx|gif|jpeg|jpg|msg|pdf|png|ppt|pptx|tif|txt|xls|xlsx|zip)(?<![\\s.])$/ regular expression',
          'fileLocationPath must be a string',
          'fileLocationPath must be longer than or equal to 24 characters',
          'fileLocationPath must match /^[a-fA-F\\d]{24}(\\/[\\w\\-:\\\\()\\s]+)*$/ regular expression',
        ],
        statusCode: 400,
      });
    });

    it('returns a 400 with validation rules if request does not meet validation rules, ignores extra field', async () => {
      const { status, body } = await api.post(getPostDocumentUrl(siteId, dealId), [{ incorrectFieldName: valueGenerator.word() }]);

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: [
          'buyerName must be a string',
          'buyerName must be longer than or equal to 1 characters',
          'buyerName must match /^(?!\\s)[\\w\\-.()\\s]+(?<![\\s.])$/ regular expression',
          'documentType must be a string',
          'documentType must be longer than or equal to 0 characters',
          'documentType must be one of the following values: Exporter_questionnaire, Audited_financial_statements, Year_to_date_management, Financial_forecasts, Financial_information_commentary, Corporate_structure',
          'fileName must be a string',
          'fileName must be longer than or equal to 5 characters',
          'fileName must match /^(?!\\s)[\\w\\-.()\\s]+.(bmp|doc|docx|gif|jpeg|jpg|msg|pdf|png|ppt|pptx|tif|txt|xls|xlsx|zip)(?<![\\s.])$/ regular expression',
          'fileLocationPath must be a string',
          'fileLocationPath must be longer than or equal to 24 characters',
          'fileLocationPath must match /^[a-fA-F\\d]{24}(\\/[\\w\\-:\\\\()\\s]+)*$/ regular expression',
        ],
        statusCode: 400,
      });
    });

    it('returns a 400 with validation error if request is empty', async () => {
      const { status, body } = await api.post(getPostDocumentUrl(siteId, dealId), '');

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: 'Validation failed (parsable array expected)',
        statusCode: 400,
      });
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
      minLength: 24,
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

  const mockSuccessfulCompleteRequest = (): MockGraphRequest => {
    mockDtfsStorageClientService
      // request to get file size
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
    return (
      mockGraphClientService
        // request to update file information
        .mockSuccessfulGraphApiCallWithPath(updateFileInfoPath)
    );
  };

  const givenAnyRequestWouldSucceedUpToReturningItem = () => {
    mockDtfsStorageClientService
      // request to get file size
      .mockSuccessfulGetShareFileClientCall(expect.any(String), expect.any(String))
      .mockSuccessfulGetPropertiesCall(fileSizeInBytes)
      // request to download file
      .mockSuccessfulGetShareFileClientCall(expect.any(String), expect.any(String))
      .mockSuccessfulDownloadCall(downloadFileResponse);
    mockGraphClientService
      // request to get sharepoint site id
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      .mockSuccessfulGraphGetCall(getSharepointSiteIdResponse);
    mockGraphClientService
      // request to get drive id
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      .mockSuccessfulGraphGetCall(getDriveIdResponse);
    mockGraphClientService
      // request to upload file
      .mockSuccessfulGetFileUploadSessionCall(expect.any(String), expect.any(Object), uploadSession)
      .mockSuccessfulGetFileUploadTaskCall(expect.any(String), getUploadTaskArgs[1], getUploadTaskArgs[2], getUploadTaskArgs[3])
      // request to get list id
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      .mockSuccessfulGraphGetCall(getListIdResponse);
  };

  const mockReturningItem = (siteId: string, dealId: string, buyerName: string, fileName: string): void => {
    const itemWebUrl = uploadFileInDealFolderGenerator.constructWebUrlForItem(siteId, dealId, buyerName, fileName);

    const itemId = getItemIdResponse.value[0].id;

    mockGraphClientService
      // first part of request to get item id (does not return item)
      .mockSuccessfulGraphApiCallWithPath(expect.any(String))
      // returning item
      .mockSuccessfulGraphGetCall({ value: [{ webUrl: itemWebUrl, id: itemId }] });
    mockGraphClientService
      // request to update file information
      .mockSuccessfulGraphApiCallWithPath(expect.anything());
  };
});
