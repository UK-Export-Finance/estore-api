import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCustodianCreateAndProvisionErrorCasesApiTests } from '@ukef-test/common-tests/custodian-create-and-provision-error-cases-api-tests';
import { withBuyerNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/buyer-name-field-validation-api-tests';
import { withSiteIdParamValidationApiTests } from '@ukef-test/common-tests/request-param-validation-api-tests/site-id-param-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { CreateBuyerFolderGenerator } from '@ukef-test/support/generator/create-buyer-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockCustodianApi } from '@ukef-test/support/mocks/custodian-api.mock';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';

describe('POST /sites/{siteId}/buyers', () => {
  const successStatusCode = 201;
  const valueGenerator = new RandomValueGenerator();
  const {
    siteId,
    createBuyerFolderRequest,
    createBuyerFolderResponse,
    scCaseSitesListSiteRequest,
    scCaseSitesListSiteResponse,
    tfisCaseSitesListExporterRequest,
    tfisCaseSitesListExporterResponse,
    tfisBuyerFolderRequest,
    tfisBuyerFolderResponse,
    custodianCreateAndProvisionRequest,
  } = new CreateBuyerFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const custodianApi = new MockCustodianApi(nock);

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
      mockSuccessfulScCaseSitesListSiteRequest();
      mockSuccessfulGetBuyerFolderRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulCreateAndProvision();
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(getPostSiteBuyersUrl(siteId), createBuyerFolderRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withCustodianCreateAndProvisionErrorCasesApiTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockSuccessfulScCaseSitesListSiteRequest();
      mockSuccessfulGetBuyerFolderRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
    },
    makeRequest: () => makeRequest(),
    custodianApi,
  });

  describe.each([
    {
      testName: 'scCaseSitesListSiteRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulTfisCaseSitesListExporterRequest();
        mockSuccessfulGetBuyerFolderRequest();
        mockSuccessfulCreateAndProvision();
      },
      givenGraphServiceCallWillThrowError: (error: Error) => {
        mockGraphClientService
          .mockSuccessfulGraphApiCallWithPath(scCaseSitesListSiteRequest.path)
          .mockSuccessfulExpandCallWithExpandString(scCaseSitesListSiteRequest.expand)
          .mockSuccessfulFilterCallWithFilterString(scCaseSitesListSiteRequest.filter)
          .mockUnsuccessfulGraphGetCall(error);
      },
    },
    {
      testName: 'tfisCaseSitesListExporterRequest',
      givenRequestWouldOtherwiseSucceed: () => {
        mockSuccessfulScCaseSitesListSiteRequest();
        mockSuccessfulGetBuyerFolderRequest();
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
  ])('$testName', ({ givenRequestWouldOtherwiseSucceed, givenGraphServiceCallWillThrowError }) => {
    withSharedGraphExceptionHandlingTests({
      givenRequestWouldOtherwiseSucceed: () => givenRequestWouldOtherwiseSucceed(),
      givenGraphServiceCallWillThrowError: (error: Error) => givenGraphServiceCallWillThrowError(error),
      makeRequest: () => api.post(getPostSiteBuyersUrl(siteId), createBuyerFolderRequest),
    });
  });

  it('returns the buyer name with status code 201 when successful', async () => {
    mockSuccessfulScCaseSitesListSiteRequest();
    mockSuccessfulGetBuyerFolderRequest();
    mockSuccessfulTfisCaseSitesListExporterRequest();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(createBuyerFolderResponse);
  });

  it('returns the buyer name with status code 201 when buyer folder exists', async () => {
    mockSuccessfulScCaseSitesListSiteRequest();
    mockSuccessfulGetBuyerFolderRequestFolderExists();
    mockSuccessfulTfisCaseSitesListExporterRequest();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(createBuyerFolderResponse);
  });

  describe('siteId error cases', () => {
    it.each([
      {
        description: 'returns a 400 if no list items are found matching the siteId in the scCaseSitesList',
        siteIdListItems: [],
        statusCode: 400,
        message: `Did not find the site ${siteId} in the scCaseSitesList.`,
      },
      {
        description: 'returns a 400 if the list item matching the siteId in the scCaseSitesList does not have an id field',
        siteIdListItems: [{ fields: { notId: valueGenerator.string() } }],
        statusCode: 400,
        message: `Missing ID for the site found with id ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the siteId in the scCaseSitesList has an id field that is not a number',
        siteIdListItems: [{ fields: { id: 'this-is-not-a-number' } }],
        statusCode: 400,
        message: `The ID for the site found for site ${siteId} is not a number (the value is this-is-not-a-number).`,
      },
    ])('$description', async ({ siteIdListItems, statusCode, message }) => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(scCaseSitesListSiteRequest.path)
        .mockSuccessfulExpandCallWithExpandString(scCaseSitesListSiteRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(scCaseSitesListSiteRequest.filter)
        .mockSuccessfulGraphGetCall({ value: siteIdListItems });
      mockSuccessfulGetBuyerFolderRequest();
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulCreateAndProvision();

      const { status, body } = await makeRequest();

      expect(status).toBe(statusCode);
      expect(body).toStrictEqual({
        message,
        statusCode,
      });
    });
  });

  describe('buyer folder exists error cases', () => {
    it.each([
      {
        description: 'returns a 500 if buyer folder presence check fails',
        existingBuyerFolderListItems: [],
        responseBody: {
          statusCode: 500,
          message: `Internal server error`,
        },
      },
    ])('$description', async ({ existingBuyerFolderListItems, responseBody }) => {
      mockSuccessfulScCaseSitesListSiteRequest();
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(tfisBuyerFolderRequest.path)
        .mockSuccessfulExpandCallWithExpandString(tfisBuyerFolderRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(tfisBuyerFolderRequest.filter)
        .mockSuccessfulGraphGetCall(existingBuyerFolderListItems);
      mockSuccessfulTfisCaseSitesListExporterRequest();
      mockSuccessfulCreateAndProvision();

      const { status, body } = await makeRequest();

      expect(status).toBe(responseBody.statusCode);
      expect(body).toStrictEqual(responseBody);
    });
  });

  describe('exporterName error cases', () => {
    it.each([
      {
        description: 'returns a 400 if no list items are found matching the exporterName in the tfisCaseSitesList',
        exporterNameListItems: [],
        statusCode: 400,
        message: `Did not find the site for siteId ${siteId} in the tfisCaseSitesList.`,
      },
      {
        description: 'returns a 400 if the list item matching the exporterName in the tfisCaseSitesList does not have a TermGuid field',
        exporterNameListItems: [{ fields: { notTermGuid: valueGenerator.string(), URL: valueGenerator.string(), SiteURL: { Url: valueGenerator.string() } } }],
        statusCode: 400,
        message: `Missing TermGuid for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the exporterName in the tfisCaseSitesList does not have a URL field',
        exporterNameListItems: [{ fields: { TermGuid: valueGenerator.string(), notURL: valueGenerator.string(), SiteURL: { Url: valueGenerator.string() } } }],
        statusCode: 400,
        message: `Missing URL for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the exporterName in the tfisCaseSitesList does not have a SiteURL field',
        exporterNameListItems: [{ fields: { TermGuid: valueGenerator.string(), URL: valueGenerator.string(), notSiteURL: { Url: valueGenerator.string() } } }],
        statusCode: 400,
        message: `Missing site URL for the list item found for exporter site ${siteId}.`,
      },
      {
        description: 'returns a 400 if the list item matching the exporterName in the tfisCaseSitesList does not have a Url field on the SiteURL field',
        exporterNameListItems: [{ fields: { TermGuid: valueGenerator.string(), URL: valueGenerator.string(), SiteURL: { notUrl: valueGenerator.string() } } }],
        statusCode: 400,
        message: `Missing site URL for the list item found for exporter site ${siteId}.`,
      },
    ])('$description', async ({ exporterNameListItems, statusCode, message }) => {
      mockSuccessfulScCaseSitesListSiteRequest();
      mockSuccessfulGetBuyerFolderRequest();
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
        .mockSuccessfulExpandCallWithExpandString(tfisCaseSitesListExporterRequest.expand)
        .mockSuccessfulFilterCallWithFilterString(tfisCaseSitesListExporterRequest.filter)
        .mockSuccessfulGraphGetCall({ value: exporterNameListItems });
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
      makeRequest: (siteId) => api.post(getPostSiteBuyersUrl(siteId), createBuyerFolderRequest),
      givenAnyRequestParamWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });
  });

  describe('field validation', () => {
    withBuyerNameFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createBuyerFolderRequest,
      makeRequest: (body: unknown[]) => makeRequestWithBody(body),
      givenAnyRequestBodyWouldSucceed: () => givenAnyRequestBodyWouldSucceed(),
      successStatusCode,
    });
  });

  const givenAnyRequestBodyWouldSucceed = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(scCaseSitesListSiteRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(scCaseSitesListSiteResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisCaseSitesListExporterResponse);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisBuyerFolderRequest.path)
      .mockSuccessfulExpandCall()
      .mockSuccessfulFilterCall()
      .mockSuccessfulGraphGetCall(tfisBuyerFolderResponse);

    custodianApi.requestToCreateAndProvisionAnyItem().respondsWith(201);
  };

  const mockSuccessfulScCaseSitesListSiteRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(scCaseSitesListSiteRequest.path)
      .mockSuccessfulExpandCallWithExpandString(scCaseSitesListSiteRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(scCaseSitesListSiteRequest.filter)
      .mockSuccessfulGraphGetCall(scCaseSitesListSiteResponse);
  };

  const mockSuccessfulTfisCaseSitesListExporterRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisCaseSitesListExporterRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisCaseSitesListExporterRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisCaseSitesListExporterRequest.filter)
      .mockSuccessfulGraphGetCall(tfisCaseSitesListExporterResponse);
  };

  const mockSuccessfulGetBuyerFolderRequest = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisBuyerFolderRequest.path)
      .mockSuccessfulFilterCallWithFilterString(tfisBuyerFolderRequest.filter)
      .mockSuccessfulExpandCallWithExpandString(tfisBuyerFolderRequest.expand)
      .mockSuccessfulGraphGetCall(tfisBuyerFolderResponse);
  };

  const mockSuccessfulGetBuyerFolderRequestFolderExists = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisBuyerFolderRequest.path)
      .mockSuccessfulFilterCallWithFilterString(tfisBuyerFolderRequest.filter)
      .mockSuccessfulExpandCallWithExpandString(tfisBuyerFolderRequest.expand)
      .mockSuccessfulGraphGetCall({ value: [{ some: 'value' }] });
  };

  const mockSuccessfulCreateAndProvision = () => {
    custodianApi.requestToCreateAndProvisionItem(JSON.stringify(custodianCreateAndProvisionRequest)).respondsWith(201);
  };

  const makeRequestWithBody = (requestBody: unknown[]) => api.post(getPostSiteBuyersUrl(siteId), requestBody);

  const makeRequest = () => makeRequestWithBody(createBuyerFolderRequest);

  const getPostSiteBuyersUrl = (siteId: string) => {
    return `/api/v1/sites/${siteId}/buyers`;
  };
});
