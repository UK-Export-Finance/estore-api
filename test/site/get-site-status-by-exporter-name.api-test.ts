import { ENUMS } from '@ukef/constants';
import { GetSiteStatusByExporterNameQueryDto } from '@ukef/modules/site/dto/get-site-status-by-exporter-name-query.dto';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withSharepointResourceNameQueryValidationApiTests } from '@ukef-test/common-tests/request-query-validation-api-tests/sharepoint-resource-name-query-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

describe('getSiteStatusByExporterName', () => {
  const endpoint_url = '/api/v1/sites';
  const valueGenerator = new RandomValueGenerator();
  const {
    siteControllerGetSiteStatusByExporterNameQueryDto,
    graphServiceGetParams: { path, expand, filter },
    graphServiceGetSiteStatusByExporterNameResponseDto,
  } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
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

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(path)
        .mockSuccessfulExpandCallWithExpandString(expand)
        .mockSuccessfulFilterCallWithFilterString(filter)
        .mockSuccessfulGraphGetCall(graphServiceGetSiteStatusByExporterNameResponseDto);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(endpoint_url, incorrectAuth?.headerName, incorrectAuth?.headerValue).query(siteControllerGetSiteStatusByExporterNameQueryDto),
  });

  withSharedGraphExceptionHandlingTests({
    givenRequestWouldOtherwiseSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(path)
        .mockSuccessfulExpandCallWithExpandString(expand)
        .mockSuccessfulFilterCallWithFilterString(filter);
    },
    givenGraphServiceCallWillThrowError: (error: Error) => {
      mockGraphClientService.mockUnsuccessfulGraphGetCall(error);
    },
    makeRequest: () => makeRequest(),
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
  it.each(statusCodeTestInputs)('returns $expectedStatusCode if site status in Sharepoint is $siteStatus', async ({ siteStatus, expectedStatusCode }) => {
    const {
      siteControllerGetSiteStatusByExporterNameQueryDto: modifiedSiteControllerGetSiteStatusByExporterNameQueryDto,
      siteStatusByExporterNameResponse: modifiedSiteStatusByExporterNameResponse,
      graphServiceGetParams: { path: modifiedPath, expand: modifiedExpand, filter: modifiedFilter },
      graphServiceGetSiteStatusByExporterNameResponseDto: modifiedGraphServiceGetSiteStatusByExporterNameResponseDto,
    } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, status: siteStatus });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(modifiedPath)
      .mockSuccessfulExpandCallWithExpandString(modifiedExpand)
      .mockSuccessfulFilterCallWithFilterString(modifiedFilter)
      .mockSuccessfulGraphGetCall(modifiedGraphServiceGetSiteStatusByExporterNameResponseDto);

    const { status, body } = await api.get(`/api/v1/sites?exporterName=${modifiedSiteControllerGetSiteStatusByExporterNameQueryDto.exporterName}`);

    expect(status).toBe(expectedStatusCode);
    expect(body).toStrictEqual(modifiedSiteStatusByExporterNameResponse);
  });

  it('returns 404 with message "Not Found" if the site does not exist in sharepoint', async () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await makeRequest();

    expect(status).toBe(404);
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  withSharepointResourceNameQueryValidationApiTests({
    queryName: 'exporterName',
    valueGenerator,
    validRequestQueries: siteControllerGetSiteStatusByExporterNameQueryDto,
    successStatusCode: 202,
    makeRequestWithQueries: (queries: GetSiteStatusByExporterNameQueryDto) => makeRequestWithQueries(queries),
    givenAnyRequestQueryWouldSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCall()
        .mockSuccessfulExpandCall()
        .mockSuccessfulFilterCall()
        .mockSuccessfulGraphGetCall(graphServiceGetSiteStatusByExporterNameResponseDto);
    },
  });

  const makeRequest = () => {
    return makeRequestWithQueries(siteControllerGetSiteStatusByExporterNameQueryDto);
  };

  const makeRequestWithQueries = (queries: GetSiteStatusByExporterNameQueryDto) => {
    return api.get(endpoint_url).query(queries);
  };
});
