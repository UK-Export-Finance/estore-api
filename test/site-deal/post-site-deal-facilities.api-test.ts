import { CUSTODIAN, ENUMS, UKEFID } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCustodianCreateAndProvisionErrorCasesApiTests } from '@ukef-test/common-tests/custodian-create-and-provision-error-cases-api-tests';
import { withBuyerNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/buyer-name-field-validation-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-validation-api-tests';
import { withSiteIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/site-id-param-validation-api-tests';
import { withParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/string-param-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockCustodianApi } from '@ukef-test/support/mocks/custodian-api.mock';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { Cache } from 'cache-manager';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';

describe('Create Site Deal Facility Folder', () => {
  const valueGenerator = new RandomValueGenerator();
  const {
    custodianRequestId,
    custodianCachekey,
    createFacilityFolderParamsDto,
    createFacilityFolderRequestItem,
    createFacilityFolderRequestDto,
    createFacilityFolderResponseDto,
    createFacilityFolderResponseWhenFolderExistsInSharepoint,
    createFacilityFolderResponseWhenFolderCustodianJobStarted,
    tfisFacilityHiddenListTermStoreFacilityTermDataRequest,
    tfisFacilityHiddenListTermStoreFacilityTermDataResponse,
    tfisFacilityListParentFolderRequest,
    tfisFacilityListParentFolderResponse,
    custodianCreateAndProvisionRequest,
    tfisFacilityFolderRequest,
    tfisFacilityFolderResponse,
    custodianJobsByRequestIdRequest,
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({
    numberToGenerate: 1,
  });

  const folderName = createFacilityFolderResponseDto.folderName;

  const custodianApi = new MockCustodianApi(nock);

  let api: Api;
  let mockGraphClientService: MockGraphClientService;
  let cacheManager: Cache;

  beforeAll(async () => {
    ({ api, mockGraphClientService, cacheManager } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
    cacheManager.reset();
  });

  afterAll(async () => {
    await api.destroy();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockSuccessfulTfisFacilityListParentFolderRequest();
      mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
      mockSuccessfulTfisFacilityFolderRequest();
      mockSuccessfulCreateAndProvision();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(
        getPostSiteDealFacilitiesUrl(createFacilityFolderParamsDto),
        createFacilityFolderRequestDto,
        incorrectAuth?.headerName,
        incorrectAuth?.headerValue,
      ),
  });

  withCustodianCreateAndProvisionErrorCasesApiTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockSuccessfulTfisFacilityListParentFolderRequest();
      mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    },
    makeRequest: () => makeRequest(),
    custodianApi,
  });

  describe.each([
    {
      testName: 'tfisFacilityHiddenListTermStoreFacilityTermDataRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisFacilityListParentFolderRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
          .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
    {
      testName: 'tfisFacilityListParentFolderRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
          .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
  ])('$testName', ({ givenRequestWouldOtherwiseSucceed, givenGraphServiceCallWillThrowError }) => {
    withSharedGraphExceptionHandlingTests({
      givenRequestWouldOtherwiseSucceed: () => givenRequestWouldOtherwiseSucceed(),
      givenGraphServiceCallWillThrowError: (error: Error) => givenGraphServiceCallWillThrowError(error),
      makeRequest: () => api.post(getPostSiteDealFacilitiesUrl(createFacilityFolderParamsDto), createFacilityFolderRequestDto),
    });
  });

  it('returns the name of the folder created with status code 201 when successful', async () => {
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulTfisFacilityFolderRequest();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(createFacilityFolderResponseDto);
  });

  it('returns the name of the folder created with status code 200 when folder already exists', async () => {
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulTfisFacilityFolderRequestWhereFolderExists();

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toEqual(createFacilityFolderResponseWhenFolderExistsInSharepoint);
  });

  it('returns the deal folder name with status code 202 when buyer folder is still processed by Custodian', async () => {
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulTfisFacilityFolderRequest();
    setCacheForPreviousCustodianJob();
    mockFolderInCustodianJobQueue();

    const { status, body } = await makeRequest();

    expect(status).toBe(202);
    expect(body).toEqual(createFacilityFolderResponseWhenFolderCustodianJobStarted);
  });

  it('returns the buyer name with status code 202 when buyer folder is sent to Custodian, but Custodian is not returning information about this job yet', async () => {
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulTfisFacilityFolderRequest();
    cacheManager.set(custodianCachekey, { requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });
    mockFolderInCustodianEmptyResponse();

    const { status, body } = await makeRequest();

    expect(status).toBe(202);
    expect(body).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET });
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest returns an empty value list', async () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Site deal folder not found: ${createFacilityFolderRequestItem.buyerName}/D ${createFacilityFolderParamsDto.dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder.`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest has no id field', async () => {
    const modifiedTfisFacilityListParentFolderResponse = JSON.parse(JSON.stringify(tfisFacilityListParentFolderResponse));
    delete modifiedTfisFacilityListParentFolderResponse.value[0].fields.id;

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityListParentFolderResponse);

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Missing id for the deal folder ${createFacilityFolderRequestItem.buyerName}/D ${createFacilityFolderParamsDto.dealId} in site ${createFacilityFolderParamsDto.siteId}.`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest has an empty string id field', async () => {
    const modifiedTfisFacilityListParentFolderResponse = JSON.parse(JSON.stringify(tfisFacilityListParentFolderResponse));
    modifiedTfisFacilityListParentFolderResponse.value[0].fields.id = '';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityListParentFolderResponse);

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Missing id for the deal folder ${createFacilityFolderRequestItem.buyerName}/D ${createFacilityFolderParamsDto.dealId} in site ${createFacilityFolderParamsDto.siteId}.`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest id field is not a number', async () => {
    const modifiedTfisFacilityListParentFolderResponse = JSON.parse(JSON.stringify(tfisFacilityListParentFolderResponse));
    const notANumber = 'not a number';
    modifiedTfisFacilityListParentFolderResponse.value[0].fields.id = notANumber;

    mockSuccessfulTfisFacilityFolderRequest();
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityListParentFolderResponse);

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `The id for the deal folder ${createFacilityFolderRequestItem.buyerName}/D ${createFacilityFolderParamsDto.dealId} in site ${createFacilityFolderParamsDto.siteId} is not a number (the value is ${notANumber}).`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityHiddenListTermStoreFacilityTermDataRequest returns an empty value list', async () => {
    mockSuccessfulTfisFacilityFolderRequest();
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Facility term not found: ${createFacilityFolderRequestItem.facilityIdentifier}. To create this resource, call POST /terms/facilities.`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityHiddenListTermStoreFacilityTermDataRequest has no FacilityGUID field', async () => {
    const modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse = JSON.parse(JSON.stringify(tfisFacilityHiddenListTermStoreFacilityTermDataResponse));
    delete modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse.value[0].fields.FacilityGUID;

    mockSuccessfulTfisFacilityFolderRequest();
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse);

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Missing FacilityGUID for facility term ${createFacilityFolderRequestItem.facilityIdentifier}.`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityHiddenListTermStoreFacilityTermDataRequest has an empty string FacilityGUID field', async () => {
    const modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse = JSON.parse(JSON.stringify(tfisFacilityHiddenListTermStoreFacilityTermDataResponse));
    modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse.value[0].fields.FacilityGUID = '';

    mockSuccessfulTfisFacilityFolderRequest();
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse);

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Missing FacilityGUID for facility term ${createFacilityFolderRequestItem.facilityIdentifier}.`,
      statusCode: 400,
    });
  });

  describe('param validation', () => {
    withSiteIdParamValidationApiTests({
      valueGenerator,
      validRequestParam: createFacilityFolderParamsDto.siteId,
      successStatusCode: 201,
      makeRequest: (siteId) => api.post(getPostSiteDealFacilitiesUrl({ siteId, dealId: createFacilityFolderParamsDto.dealId }), createFacilityFolderRequestDto),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withParamValidationApiTests({
      paramName: 'dealId',
      length: 10,
      pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
      generateParamValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
      generateParamValueThatDoesNotMatchRegex: () => '11000000' as UkefId,
      validRequestParam: createFacilityFolderParamsDto.dealId,
      successStatusCode: 201,
      makeRequest: (dealId) => api.post(getPostSiteDealFacilitiesUrl({ dealId, siteId: createFacilityFolderParamsDto.siteId }), createFacilityFolderRequestDto),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });
  });

  describe('field validation', () => {
    withBuyerNameFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      successStatusCode: 201,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withFacilityIdentifierFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      successStatusCode: 201,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });
  });

  const givenAnyRequestBodyWouldSucceed = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisFacilityListParentFolderResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisFacilityHiddenListTermStoreFacilityTermDataResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityFolderRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisFacilityFolderResponse);

    custodianApi.requestToCreateAndProvisionAnyItem().respondsWith(201);
  };

  const mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall(tfisFacilityHiddenListTermStoreFacilityTermDataResponse);
  };

  const mockSuccessfulTfisFacilityListParentFolderRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(tfisFacilityListParentFolderResponse);
  };

  const mockSuccessfulTfisFacilityFolderRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityFolderRequest.filter)
      .mockSuccessfulGraphGetCall(tfisFacilityFolderResponse);
  };

  const mockSuccessfulTfisFacilityFolderRequestWhereFolderExists = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityFolderRequest.filter)
      .mockSuccessfulGraphGetCall({ value: [{ some: 'value' }] });
  };

  const mockSuccessfulCreateAndProvision = () => {
    mockSuccessfulCreateAndProvisionWithBody(JSON.stringify(custodianCreateAndProvisionRequest));
  };

  const mockSuccessfulCreateAndProvisionWithBody = (requestBody: nock.RequestBodyMatcher) => {
    custodianApi.requestToCreateAndProvisionItem(requestBody).respondsWith(201);
  };

  const makeRequestWithBody = (requestBody: unknown[]) => {
    return api.post(getPostSiteDealFacilitiesUrl(createFacilityFolderParamsDto), requestBody);
  };

  const makeRequest = () => {
    return api.post(getPostSiteDealFacilitiesUrl(createFacilityFolderParamsDto), createFacilityFolderRequestDto);
  };

  const getPostSiteDealFacilitiesUrl = (params: { siteId: string; dealId: string }) => {
    const { siteId, dealId } = params;
    return `/api/v1/sites/${siteId}/deals/${dealId}/facilities`;
  };

  const setCacheForPreviousCustodianJob = () => {
    cacheManager.set(custodianCachekey, { requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });
  };

  const mockFolderInCustodianEmptyResponse = () => {
    custodianApi.requestToReadJobsByRequestId(JSON.stringify(custodianJobsByRequestIdRequest)).respondsWith(200, []);
  };

  const mockFolderInCustodianJobQueue = () => {
    custodianApi.requestToReadJobsByAnyRequestId().respondsWith(200, [
      {
        Started: valueGenerator.dateTimeString(),
        Completed: CUSTODIAN.EMPTY_DATE,
        Failed: false,
      },
    ]);
  };
});
