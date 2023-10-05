import { CUSTODIAN, ENUMS } from '@ukef/constants';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCustodianCreateAndProvisionErrorCasesApiTests } from '@ukef-test/common-tests/custodian-create-and-provision-error-cases-api-tests';
import { withBuyerNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/buyer-name-field-validation-api-tests';
import { withDealIdentifierFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/deal-identifier-validation-api-tests';
import { withSharepointResourceNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/sharepoint-resource-name-field-validation-api-tests';
import { withSiteIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/site-id-param-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { CreateDealFolderGenerator } from '@ukef-test/support/generator/create-deal-folder-generator';
import { CreateFolderBaseGenerator } from '@ukef-test/support/generator/create-folder-base-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockCustodianApi } from '@ukef-test/support/mocks/custodian-api.mock';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { Cache } from 'cache-manager';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';

describe('POST /sites/{siteId}/deals', () => {
  const successStatusCode = 201;
  const valueGenerator = new RandomValueGenerator();
  const {
    siteId,
    parentFolderId,
    dealFolderName: folderName,
    createDealFolderRequestItem: { buyerName, destinationMarket, riskMarket },
    createDealFolderRequest,
    tfisDealListBuyerRequest,
    tfisDealListBuyerResponse,
    tfisGetDealFolderRequest,
    tfisGetDealFolderResponse,
    tfisCaseSitesListExporterRequest,
    tfisCaseSitesListExporterResponse,
    taxonomyHiddenListTermStoreDestinationMarketRequest,
    taxonomyHiddenListTermStoreDestinationMarketResponse,
    taxonomyHiddenListTermStoreRiskMarketRequest,
    taxonomyHiddenListTermStoreRiskMarketResponse,
    custodianCreateAndProvisionRequest,
  } = new CreateDealFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const {
    custodianRequestId,
    custodianCachekey,
    createFolderResponse,
    createFolderResponseWhenFolderExistsInSharepoint,
    createFolderResponseWhenFolderCustodianJobStarted,
    custodianJobsByRequestIdRequest,
  } = new CreateFolderBaseGenerator(valueGenerator).generate({ numberToGenerate: 1, parentFolderId, folderName });

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
      mockSuccessfulTfisDealListBuyerRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
      mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
      mockSuccessfulCreateAndProvision();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(getPostSiteDealsUrl(siteId), createDealFolderRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withCustodianCreateAndProvisionErrorCasesApiTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockSuccessfulTfisDealListBuyerRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
      mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
    },
    makeRequest: () => makeRequest(),
    custodianApi,
  });

  describe.each([
    {
      testName: 'tfisDealListBuyerRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisCaseSitesListExporterRequest();
        mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
        mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(tfisDealListBuyerRequest.path)
          .mockSuccessfulExpandCallWithExpandString(tfisDealListBuyerRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(tfisDealListBuyerRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
    {
      testName: 'tfisCaseSitesListExporterRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisDealListBuyerRequest();
        mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
        mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
          .mockSuccessfulExpandCallWithExpandString(tfisCaseSitesListExporterRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(tfisCaseSitesListExporterRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
    {
      testName: 'taxonomyHiddenListTermStoreDestinationMarketRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisDealListBuyerRequest();
        mockSuccessfulTfisCaseSitesListExporterRequest();
        mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreDestinationMarketRequest.path)
          .mockSuccessfulExpandCallWithExpandString(taxonomyHiddenListTermStoreDestinationMarketRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(taxonomyHiddenListTermStoreDestinationMarketRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
    {
      testName: 'taxonomyHiddenListTermStoreRiskMarketRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisDealListBuyerRequest();
        mockSuccessfulTfisCaseSitesListExporterRequest();
        mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreRiskMarketRequest.path)
          .mockSuccessfulExpandCallWithExpandString(taxonomyHiddenListTermStoreRiskMarketRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(taxonomyHiddenListTermStoreRiskMarketRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
  ])('$testName', ({ givenRequestWouldOtherwiseSucceed, givenGraphServiceCallWillThrowError }) => {
    withSharedGraphExceptionHandlingTests({
      givenRequestWouldOtherwiseSucceed: () => givenRequestWouldOtherwiseSucceed(),
      givenGraphServiceCallWillThrowError: (error: Error) => givenGraphServiceCallWillThrowError(error),
      makeRequest: () => api.post(getPostSiteDealsUrl(siteId), createDealFolderRequest),
    });
  });

  it('returns the name of the folder created with status code 201 when successful', async () => {
    mockSuccessfulTfisDealListBuyerRequest();
    mockSuccessfulTfisCaseSitesListExporterRequest();
    mockSuccessfulGetDealFolderRequest();
    mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
    mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(createFolderResponse);
  });

  it('returns the name of the folder created with status code 200 when folder exists', async () => {
    mockSuccessfulTfisDealListBuyerRequest();
    mockSuccessfulTfisCaseSitesListExporterRequest();
    mockSuccessfulGetDealFolderRequestWhereFolderExists();
    mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
    mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();

    const { status, body } = await makeRequest();

    expect(status).toBe(200);
    expect(body).toEqual(createFolderResponseWhenFolderExistsInSharepoint);
  });

  it('returns the deal folder name with status code 202 when buyer folder is still processed by Custodian', async () => {
    mockSuccessfulTfisDealListBuyerRequest();
    mockSuccessfulTfisCaseSitesListExporterRequest();
    mockSuccessfulGetDealFolderRequest();
    setCacheForPreviousCustodianJob();
    mockFolderInCustodianJobQueue();

    const { status, body } = await makeRequest();

    expect(status).toBe(202);
    expect(body).toEqual(createFolderResponseWhenFolderCustodianJobStarted);
  });

  it('returns the buyer name with status code 202 when buyer folder is sent to Custodian, but Custodian is not returning information about this job yet', async () => {
    mockSuccessfulTfisDealListBuyerRequest();
    mockSuccessfulTfisCaseSitesListExporterRequest();
    mockSuccessfulGetDealFolderRequest();
    cacheManager.set(custodianCachekey, { requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });
    mockFolderInCustodianEmptyResponse();

    const { status, body } = await makeRequest();

    expect(status).toBe(202);
    expect(body).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET });
  });

  describe('buyerName error cases', () => {
    it.each([
      {
        description: 'returns a 400 if no list items are found matching the buyerName in the tfisDealList',
        buyerNameListItems: [],
        statusCode: 400,
        message: `Did not find a folder for buyer ${buyerName} in site ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the buyerName in the tfisDealList does not have an id field',
        buyerNameListItems: [{ fields: { notId: valueGenerator.string() } }],
        statusCode: 400,
        message: `Missing id for the folder found for ${buyerName} in site ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the buyerName in the tfisDealList has an id field that is not a number',
        buyerNameListItems: [{ fields: { id: 'this-is-not-a-number' } }],
        statusCode: 400,
        message: `The id for the folder found for ${buyerName} in site ${siteId} is not a number (the value is this-is-not-a-number).`,
      },
    ])('$description', async ({ buyerNameListItems, statusCode, message }) => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(tfisDealListBuyerRequest.path)
        .mockSuccessfulExpandCallWithExpandString(tfisDealListBuyerRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(tfisDealListBuyerRequest.filter)
        .mockSuccessfulGraphGetCall({ value: buyerNameListItems });
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
      mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
      mockSuccessfulCreateAndProvision();

      const { status, body } = await makeRequest();

      expect(status).toBe(statusCode);
      expect(body).toStrictEqual({
        message,
        statusCode,
      });
    });
  });

  describe('ExporterRequest error cases', () => {
    it.each([
      {
        description: 'returns a 400 if no list items are found matching the exporterName in the tfisCaseSitesList',
        ExporterRequestListItems: [],
        statusCode: 400,
        message: `Did not find the siteId ${siteId} in the tfisCaseSitesList.`,
      },
      {
        description: 'returns a 400 if the list item matching the exporterName in the tfisCaseSitesList does not have a TermGuid field',
        ExporterRequestListItems: [{ fields: { notTermGuid: valueGenerator.string(), URL: valueGenerator.string() } }],
        statusCode: 400,
        message: `Missing TermGuid for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the exporterName in the tfisCaseSitesList does not have a URL field',
        ExporterRequestListItems: [{ fields: { TermGuid: valueGenerator.string(), notURL: valueGenerator.string() } }],
        statusCode: 400,
        message: `Missing URL for the list item found for exporter site ${siteId}.`,
      },
    ])('$description', async ({ ExporterRequestListItems, statusCode, message }) => {
      mockSuccessfulTfisDealListBuyerRequest();
      mockSuccessfulGetDealFolderRequest();
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
        .mockSuccessfulExpandCallWithExpandString(tfisCaseSitesListExporterRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(tfisCaseSitesListExporterRequest.filter)
        .mockSuccessfulGraphGetCall({ value: ExporterRequestListItems });

      const { status, body } = await makeRequest();

      expect(status).toBe(statusCode);
      expect(body).toStrictEqual({
        message,
        statusCode,
      });
    });
  });

  describe('destinationMarket error cases', () => {
    it.each([
      {
        description: 'returns a 400 if no list items are found matching the destinationMarket in the taxonomyHiddenListTermStore',
        destinationMarketListItems: [],
        statusCode: 400,
        message: `Did not find the market ${destinationMarket} in the taxonomyHiddenListTermStore.`,
      },
      {
        description: 'returns a 400 if the list item matching the destinationMarket in the taxonomyHiddenListTermStore does not have a TermGuid field',
        destinationMarketListItems: [{ fields: { notTermGuid: valueGenerator.string() } }],
        statusCode: 400,
        message: `Missing TermGuid for the market list item found for ${destinationMarket}.`,
      },
    ])('$description', async ({ destinationMarketListItems, statusCode, message }) => {
      mockSuccessfulTfisDealListBuyerRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulGetDealFolderRequest();
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreDestinationMarketRequest.path)
        .mockSuccessfulExpandCallWithExpandString(taxonomyHiddenListTermStoreDestinationMarketRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(taxonomyHiddenListTermStoreDestinationMarketRequest.filter)
        .mockSuccessfulGraphGetCall({ value: destinationMarketListItems });
      mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
      mockSuccessfulCreateAndProvision();

      const { status, body } = await makeRequest();

      expect(status).toBe(statusCode);
      expect(body).toStrictEqual({
        message,
        statusCode,
      });
    });
  });

  describe('deal folder exists error cases', () => {
    it.each([
      {
        description: 'returns a 500 if deal folder presence check fails',
        existingDealFolderListItems: [],
        responseBody: {
          statusCode: 500,
          message: `Internal server error`,
        },
      },
    ])('$description', async ({ existingDealFolderListItems, responseBody }) => {
      mockSuccessfulTfisDealListBuyerRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(tfisGetDealFolderRequest.path)
        .mockSuccessfulExpandCallWithExpandString(tfisGetDealFolderRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(tfisGetDealFolderRequest.filter)
        .mockSuccessfulGraphGetCall(existingDealFolderListItems);
      mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
      mockSuccessfulTaxonomyTermStoreListRiskMarketRequest();
      mockSuccessfulCreateAndProvision();

      const { status, body } = await makeRequest();

      expect(status).toBe(responseBody.statusCode);
      expect(body).toStrictEqual(responseBody);
    });
  });

  describe('riskMarket error cases', () => {
    it.each([
      {
        description: 'returns a 400 if no list items are found matching the riskMarket in the taxonomyHiddenListTermStore',
        riskMarketListItems: [],
        statusCode: 400,
        message: `Did not find the market ${riskMarket} in the taxonomyHiddenListTermStore.`,
      },
      {
        description: 'returns a 400 if the list item matching the riskMarket in the taxonomyHiddenListTermStore does not have a TermGuid field',
        riskMarketListItems: [{ fields: { notTermGuid: valueGenerator.string() } }],
        statusCode: 400,
        message: `Missing TermGuid for the market list item found for ${riskMarket}.`,
      },
    ])('$description', async ({ riskMarketListItems, statusCode, message }) => {
      mockSuccessfulTfisDealListBuyerRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulGetDealFolderRequest();
      mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest();
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreRiskMarketRequest.path)
        .mockSuccessfulExpandCallWithExpandString(taxonomyHiddenListTermStoreRiskMarketRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(taxonomyHiddenListTermStoreRiskMarketRequest.filter)
        .mockSuccessfulGraphGetCall({ value: riskMarketListItems });
      mockSuccessfulCreateAndProvision();

      const { status, body } = await makeRequest();

      expect(status).toBe(statusCode);
      expect(body).toStrictEqual({
        message,
        statusCode,
      });
    });
  });

  describe('param validation', () => {
    withSiteIdParamValidationApiTests({
      valueGenerator,
      validRequestParam: siteId,
      makeRequest: (siteId) => api.post(getPostSiteDealsUrl(siteId), createDealFolderRequest),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });
  });

  describe('field validation', () => {
    withDealIdentifierFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createDealFolderRequest,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });

    withBuyerNameFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createDealFolderRequest,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });

    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'destinationMarket',
      valueGenerator,
      validRequestBody: createDealFolderRequest,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });

    withSharepointResourceNameFieldValidationApiTests({
      fieldName: 'riskMarket',
      valueGenerator,
      validRequestBody: createDealFolderRequest,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });
  });

  const givenAnyRequestBodyWouldSucceed = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisDealListBuyerRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisDealListBuyerResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisCaseSitesListExporterResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisGetDealFolderRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisGetDealFolderResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreDestinationMarketRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(taxonomyHiddenListTermStoreDestinationMarketResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreRiskMarketRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(taxonomyHiddenListTermStoreDestinationMarketResponse);

    custodianApi.requestToCreateAndProvisionAnyItem().respondsWith(201);
  };

  const mockSuccessfulTfisDealListBuyerRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisDealListBuyerRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisDealListBuyerRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisDealListBuyerRequest.filter)
      .mockSuccessfulGraphGetCall(tfisDealListBuyerResponse);
  };

  const mockSuccessfulTfisCaseSitesListExporterRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisCaseSitesListExporterRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisCaseSitesListExporterRequest.filter)
      .mockSuccessfulGraphGetCall(tfisCaseSitesListExporterResponse);
  };

  const mockSuccessfulGetDealFolderRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisGetDealFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisGetDealFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisGetDealFolderRequest.filter)
      .mockSuccessfulGraphGetCall(tfisGetDealFolderResponse);
  };

  const mockSuccessfulGetDealFolderRequestWhereFolderExists = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisGetDealFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisGetDealFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisGetDealFolderRequest.filter)
      .mockSuccessfulGraphGetCall({ value: [{ some: 'value' }] });
  };

  const mockSuccessfulTaxonomyTermStoreListDestinationMarketRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreDestinationMarketRequest.path)
      .mockSuccessfulExpandCallWithExpandString(taxonomyHiddenListTermStoreDestinationMarketRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(taxonomyHiddenListTermStoreDestinationMarketRequest.filter)
      .mockSuccessfulGraphGetCall(taxonomyHiddenListTermStoreDestinationMarketResponse);
  };

  const mockSuccessfulTaxonomyTermStoreListRiskMarketRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(taxonomyHiddenListTermStoreRiskMarketRequest.path)
      .mockSuccessfulExpandCallWithExpandString(taxonomyHiddenListTermStoreRiskMarketRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(taxonomyHiddenListTermStoreRiskMarketRequest.filter)
      .mockSuccessfulGraphGetCall(taxonomyHiddenListTermStoreRiskMarketResponse);
  };
  const mockSuccessfulCreateAndProvision = () => {
    custodianApi.requestToCreateAndProvisionItem(JSON.stringify(custodianCreateAndProvisionRequest)).respondsWith(201);
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

  const makeRequestWithBody = (requestBody: unknown[]) => api.post(getPostSiteDealsUrl(siteId), requestBody);

  const makeRequest = () => makeRequestWithBody(createDealFolderRequest);

  const getPostSiteDealsUrl = (siteId: string) => {
    return `/api/v1/sites/${siteId}/deals`;
  };
});
