import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withFacilityIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/facility-identifier-validation-api-tests';
import { withSharepointResourceNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/sharepoint-resource-name-field-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';

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
      message: `Facility term folder not found: ${createFacilityFolderRequestItem.facilityIdentifier}. To create this resource, call POST /terms/facility`,
      statusCode: 400,
    });
  });

    it('returns a 500 if the folder creation fails', async () => {
      mockSuccessfulTfisFacilityListParentFolderRequest();
      mockSuccessfulTfisFacilityHiddenListTermStoreFacilityTermDataRequest();
      mockUnsuccessfulCreateAndProvision

      const { status, body } = await makeRequest();
  
      expect(status).toBe(500);
      expect(body).toStrictEqual({statusCode: 500, message: 'Internal server error'});
  
    }
    );

  // describe('query validation', () => {});
  describe('field validation', () => {
    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'exporterName',
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'buyerName',
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'destinationMarket',
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'riskMarket',
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
    });

    withFacilityIdentifierFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createFacilityFolderRequestDto,
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
  }

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
    nock(ENVIRONMENT_VARIABLES.CUSTODIAN_BASE_URL)
      .post('/Create/CreateAndProvision', requestBody)
      .matchHeader('Content-Type', 'application/json')
      .reply(201);
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
});
