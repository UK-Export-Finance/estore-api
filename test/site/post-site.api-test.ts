import { ENUMS } from '@ukef/constants';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withMdmNumbersErrorCasesApiTests } from '@ukef-test/common-tests/mdm-numbers-error-cases-api-tests';
import { withExporterNameFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/exporter-name-field-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { MockMdmApi } from '@ukef-test/support/mocks/mdm-api.mock';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';

describe('createSite', () => {
  const valueGenerator = new RandomValueGenerator();

  let api: Api;
  let mockGraphClientService: MockGraphClientService;
  const mdmApi = new MockMdmApi(nock);

  const { siteControllerGetSiteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
    numberToGenerate: 1,
  });

  const { exporterName } = siteControllerGetSiteStatusByExporterNameQueryDto;

  const { createSiteRequest, graphServicePostParams, graphCreateSiteResponseDto, mdmCreateNumbersRequest, mdmCreateNumbersResponse } = new CreateSiteGenerator(
    valueGenerator,
  ).generate({
    numberToGenerate: 1,
    status: ENUMS.SITE_STATUSES.PROVISIONING,
    exporterName,
  });

  beforeAll(async () => {
    ({ api, mockGraphClientService } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  afterAll(async () => {
    await api.destroy();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
        .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
        .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
        .mockSuccessfulGraphGetCall({ value: [] });

      mdmApi.requestGenerateNewNumbers(JSON.stringify(mdmCreateNumbersRequest)).respondsWith(201, mdmCreateNumbersResponse[0]);

      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
        .mockSuccessfulGraphPostCallWithRequestBody(graphServicePostParams[0].requestBody, graphCreateSiteResponseDto[0]);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth('/api/v1/sites', createSiteRequest, incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withSharedGraphExceptionHandlingTests({
    givenRequestWouldOtherwiseSucceed: () => {},
    givenGraphServiceCallWillThrowError: (error: Error) => {
      mockGraphClientService.mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path).mockUnsuccessfulGraphGetCall(error);
    },
    makeRequest: () => api.post(`/api/v1/sites`, createSiteRequest),
  });

  withMdmNumbersErrorCasesApiTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
        .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
        .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
        .mockSuccessfulGraphGetCall({ value: [] });
    },
    makeRequest: () => api.post(`/api/v1/sites`, createSiteRequest),
    mdmApi,
  });

  const statusCodeTestInputs = [
    {
      siteStatus: ENUMS.SITE_STATUSES.CREATED,
      expectedStatusCode: 200,
    },
    {
      siteStatus: ENUMS.SITE_STATUSES.PROVISIONING,
      expectedStatusCode: 202,
    },
    {
      siteStatus: ENUMS.SITE_STATUSES.FAILED,
      expectedStatusCode: 424,
    },
  ];
  it.each(statusCodeTestInputs)('returns $expectedStatusCode if graph replies with $siteStatus', async ({ siteStatus, expectedStatusCode }) => {
    const {
      siteControllerGetSiteStatusByExporterNameQueryDto: createSiteRequestItem,
      siteStatusByExporterNameResponse: createSiteResponse,
      graphServiceGetParams: { path: modifiedPath, expand: modifiedExpand, filter: modifiedFilter },
      graphServiceGetResponse: modifiedGraphServiceGetResponse,
    } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, status: siteStatus });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(modifiedPath)
      .mockSuccessfulExpandCallWithExpandString(modifiedExpand)
      .mockSuccessfulFilterCallWithFilterString(modifiedFilter)
      .mockSuccessfulGraphGetCall(modifiedGraphServiceGetResponse);

    const { status, body } = await api.post('/api/v1/sites', [createSiteRequestItem]);
    expect(status).toBe(expectedStatusCode);
    expect(body).toStrictEqual(createSiteResponse);
  });

  it('returns 202 with status Provisioning if the site does not exist in Sharepoint and new site creation started', async () => {
    const { siteControllerGetSiteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
      numberToGenerate: 1,
    });

    const { exporterName } = siteControllerGetSiteStatusByExporterNameQueryDto;

    const { createSiteRequest, createSiteResponse, graphServicePostParams, graphCreateSiteResponseDto, mdmCreateNumbersResponse } = new CreateSiteGenerator(
      valueGenerator,
    ).generate({
      numberToGenerate: 1,
      status: ENUMS.SITE_STATUSES.PROVISIONING,
      exporterName,
    });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    mdmApi.requestGenerateNewNumbers(JSON.stringify(mdmCreateNumbersRequest)).respondsWith(201, mdmCreateNumbersResponse[0]);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
      .mockSuccessfulGraphPostCallWithRequestBody(graphServicePostParams[0].requestBody, graphCreateSiteResponseDto[0]);

    const { status, body } = await api.post('/api/v1/sites', createSiteRequest);
    expect(status).toBe(202);
    expect(body).toStrictEqual(createSiteResponse[0]);
  });

  it('returns 500 with message Internal server error, if mdm call fails', async () => {
    const { siteControllerGetSiteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
      numberToGenerate: 1,
    });

    const { exporterName } = siteControllerGetSiteStatusByExporterNameQueryDto;

    const { createSiteRequest } = new CreateSiteGenerator(valueGenerator).generate({
      numberToGenerate: 1,
      status: ENUMS.SITE_STATUSES.PROVISIONING,
      exporterName,
    });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    mdmApi.requestGenerateNewNumbers(JSON.stringify(mdmCreateNumbersRequest)).respondsWith(500, { message: 'Internal server error' });

    const { status, body } = await api.post('/api/v1/sites', createSiteRequest);
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('returns 500 with message Internal server error, if mdm call is unauthorised', async () => {
    const { siteControllerGetSiteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
      numberToGenerate: 1,
    });

    const { exporterName } = siteControllerGetSiteStatusByExporterNameQueryDto;

    const { createSiteRequest } = new CreateSiteGenerator(valueGenerator).generate({
      numberToGenerate: 1,
      status: ENUMS.SITE_STATUSES.PROVISIONING,
      exporterName,
    });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    mdmApi.requestGenerateNewNumbers(JSON.stringify(mdmCreateNumbersRequest)).respondsWith(401, 'Unauthorized');

    const { status, body } = await api.post('/api/v1/sites', createSiteRequest);
    expect(status).toBe(500);
    expect(body).toStrictEqual({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post('/api/v1/sites', body);

    const givenAnyRequestBodyWouldSucceed = () => {
      const { graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
        numberToGenerate: 1,
      });

      const { graphServicePostParams, graphCreateSiteResponseDto } = new CreateSiteGenerator(valueGenerator).generate({
        numberToGenerate: 1,
        status: ENUMS.SITE_STATUSES.PROVISIONING,
        exporterName,
      });

      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
        .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
        .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
        .mockSuccessfulGraphGetCall({ value: [] });

      mdmApi.requestGenerateNewNumbers(JSON.stringify(mdmCreateNumbersRequest)).respondsWith(201, mdmCreateNumbersResponse[0]);

      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
        .mockSuccessfulGraphPostCallWithRequestBody(expect.anything(), graphCreateSiteResponseDto[0]);
    };

    withExporterNameFieldValidationApiTests({
      valueGenerator,
      validRequestBody: createSiteRequest,
      successStatusCode: 202,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });

    it('returns a 400 with validation error if request is empty', async () => {
      const { status, body } = await api.post('/api/v1/sites', '');

      expect(status).toBe(400);
      expect(body).toStrictEqual({
        error: 'Bad Request',
        message: 'Validation failed (parsable array expected)',
        statusCode: 400,
      });
    });
  });
});
