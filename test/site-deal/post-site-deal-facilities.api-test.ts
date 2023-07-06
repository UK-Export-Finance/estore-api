import { UKEFID } from '@ukef/constants';
import { UkefId, UkefSiteId } from '@ukef/helpers';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-validation-api-tests';
import { withSharepointResourceNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/sharepoint-resource-name-field-validation-api-tests';
import { withParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/string-param-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';
import { CreateFacilityFolderRequestItem } from '@ukef/modules/site-deal/dto/create-facility-folder-request.dto';

describe('Create Site Deal Facility Folder', () => {
  const valueGenerator = new RandomValueGenerator();
  const {
    createFacilityFolderParamsDto,
    createFacilityFolderRequestItem,
    createFacilityFolderRequestDto,
    createFacilityFolderResponseDto,
    tfisFacilityHiddenListTermStoreFacilityTermDataRequest,
    tfisFacilityHiddenListTermStoreFacilityTermDataResponse,
    tfisFacilityListParentFolderRequest,
    tfisFacilityListParentFolderResponse,
    custodianCreateAndProvisionRequest,
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({
    numberToGenerate: 1,
  });

  let api: Api;
  let mockGraphClientService: MockGraphClientService;

  beforeAll(async () => {
    ({ api, mockGraphClientService } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
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

  describe.each([
    {
      testName: 'tfisFacilityHiddenListTermStoreFacilityTermDataRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisFacilityListParentFolderRequest();
        mockSuccessfulCreateAndProvision();
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
          .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter);
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService.mockUnsuccessfulGraphGetCall(error);
      },
    },
    {
      testName: 'tfisFacilityListParentFolderRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
        mockSuccessfulCreateAndProvision();
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
          .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter);
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService.mockUnsuccessfulGraphGetCall(error);
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
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(createFacilityFolderResponseDto);
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest returns an empty value list', async () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall({ value: [] });
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: `Site deal folder not found: ${createFacilityFolderRequestItem.buyerName}/D ${createFacilityFolderParamsDto.dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest has no id field', async () => {
    let modifiedTfisFacilityListParentFolderResponse = JSON.parse(JSON.stringify(tfisFacilityListParentFolderResponse));
    delete modifiedTfisFacilityListParentFolderResponse.value[0].fields.id;

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityListParentFolderResponse);
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: getParentFolderNotFoundErrorMessage(createFacilityFolderRequestItem.buyerName, createFacilityFolderParamsDto.dealId),
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityListParentFolderRequest id field is not a number', async () => {
    let modifiedTfisFacilityListParentFolderResponse = JSON.parse(JSON.stringify(tfisFacilityListParentFolderResponse));
    modifiedTfisFacilityListParentFolderResponse.value[0].fields.id = 'not a number';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityListParentFolderResponse);
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: getParentFolderNotFoundErrorMessage(createFacilityFolderRequestItem.buyerName, createFacilityFolderParamsDto.dealId),
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityHiddenListTermStoreFacilityTermDataRequest returns an empty value list', async () => {
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulCreateAndProvision();
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: getFacilityTermDateRequestNotFoundErrorMessage(createFacilityFolderRequestItem.facilityIdentifier),
      statusCode: 400,
    });
  });

  it('returns a 400 if the list item query to tfisFacilityHiddenListTermStoreFacilityTermDataRequest has no facilityGUID field', async () => {
    let modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse = JSON.parse(JSON.stringify(tfisFacilityHiddenListTermStoreFacilityTermDataResponse));
    delete modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse.value[0].fields.FacilityGUID;

    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulCreateAndProvision();
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall(modifiedTfisFacilityHiddenListTermStoreFacilityTermDataResponse);

    const { status, body } = await makeRequest();

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      message: getFacilityTermDateRequestNotFoundErrorMessage(createFacilityFolderRequestItem.facilityIdentifier),
      statusCode: 400,
    });
  });

  it('returns a 500 if the folder creation fails', async () => {
    mockSuccessfulTfisFacilityListParentFolderRequest();
    mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
    mockUnsuccessfulCreateAndProvision;

    const { status, body } = await makeRequest();

    expect(status).toBe(500);
    expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
  });

  describe('param validation', () => {
    withParamValidationApiTests({
      paramName: 'siteId',
      length: 8,
      pattern: UKEFID.SITE_ID.REGEX,
      generateParamValueOfLength: (length: number) => valueGenerator.ukefSiteId(length - 4),
      generateParamValueThatDoesNotMatchRegex: () => '00000000' as UkefSiteId,
      validRequestParam: createFacilityFolderParamsDto.siteId,
      successStatusCode: 201,
      makeRequest: (siteId) => api.post(getPostSiteDealFacilitiesUrl({ siteId, dealId: createFacilityFolderParamsDto.dealId }), createFacilityFolderRequestDto),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withParamValidationApiTests({
      paramName: 'dealId',
      length: 10,
      pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
      generateParamValueOfLength: (length: number) => valueGenerator.ukefSiteId(length - 4),
      generateParamValueThatDoesNotMatchRegex: () => '11000000' as UkefId,
      validRequestParam: createFacilityFolderParamsDto.dealId,
      successStatusCode: 201,
      makeRequest: (dealId) => api.post(getPostSiteDealFacilitiesUrl({ dealId, siteId: createFacilityFolderParamsDto.siteId }), createFacilityFolderRequestDto),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });
  });

  describe('field validation', () => {
    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'exporterName',
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      successStatusCode: 201,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'buyerName',
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

    const requestBodyPlaceholder = '*';
    nock(ENVIRONMENT_VARIABLES.CUSTODIAN_BASE_URL)
      .filteringRequestBody(() => requestBodyPlaceholder)
      .post(`/Create/CreateAndProvision`, requestBodyPlaceholder)
      .matchHeader('Content-Type', 'application/json')
      .reply(201);
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

  const mockUnsuccessfulCreateAndProvision = () => {
    mockUnsuccessfulCreateAndProvisionWithBody(JSON.stringify(custodianCreateAndProvisionRequest));
  };

  const mockUnsuccessfulCreateAndProvisionWithBody = (requestBody: nock.RequestBodyMatcher) => {
    nock(ENVIRONMENT_VARIABLES.CUSTODIAN_BASE_URL)
      .post('/Create/CreateAndProvision', requestBody)
      .matchHeader('Content-Type', 'application/json')
      .reply(400, 'Error');
  };

  const mockSuccessfulCreateAndProvision = () => {
    mockSuccessfulCreateAndProvisionWithBody(JSON.stringify(custodianCreateAndProvisionRequest));
  };

  const mockSuccessfulCreateAndProvisionWithBody = (requestBody: nock.RequestBodyMatcher) => {
    nock(ENVIRONMENT_VARIABLES.CUSTODIAN_BASE_URL).post('/Create/CreateAndProvision', requestBody).matchHeader('Content-Type', 'application/json').reply(201);
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
  const getFacilityTermDateRequestNotFoundErrorMessage = (facilityIdentifier: string): string => {
    return `Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /terms/facility`;
  };

  const getParentFolderNotFoundErrorMessage = (buyerName: string, dealId: string): string => {
    return `Site deal folder not found: ${buyerName}/D ${dealId}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`;
  };
});
