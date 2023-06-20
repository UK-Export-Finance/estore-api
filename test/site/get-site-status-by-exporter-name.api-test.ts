import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withCommonGraphExceptionHandlingTests } from '@ukef-test/common-tests/common-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

describe('getSiteStatusByExporterName', () => {
  const valueGenerator = new RandomValueGenerator();
  const {
    siteStatusByExporterNameQueryDto,
    graphServiceGetParams: { path, expand, filter },
    graphGetSiteStatusResponseDto,
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
        .mockSuccessfulGraphGetCall(graphGetSiteStatusResponseDto);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.getWithoutAuth(getSiteStatusByExporterNameUrl({}), incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withCommonGraphExceptionHandlingTests({
    givenRequestWouldOtherwiseSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(path)
        .mockSuccessfulExpandCallWithExpandString(expand)
        .mockSuccessfulFilterCallWithFilterString(filter);
    },
    givenGraphServiceCallWillThrowError: (error: Error) => {
      mockGraphClientService.mockUnsuccessfulGraphGetCall(error);
    },
    makeRequest: () => api.get(getSiteStatusByExporterNameUrl({})),
  });

  const statusCodeTestInputs = [
    {
      siteStatus: 'Created',
      expectedStatusCode: 200,
    },
    {
      siteStatus: 'Provisioning',
      expectedStatusCode: 202,
    },
    {
      siteStatus: 'Failed',
      expectedStatusCode: 424,
    },
  ];
  it.each(statusCodeTestInputs)('returns $expectedStatusCode if graph replies with $siteStatus', async ({ siteStatus, expectedStatusCode }) => {
    const {
      siteStatusByExporterNameQueryDto: modifiedSiteStatusByExporterNameQueryDto,
      siteStatusByExporterNameResponse: modifiedSiteStatusByExporterNameResponse,
      graphServiceGetParams: { path: modifiedPath, expand: modifiedExpand, filter: modifiedFilter },
      graphGetSiteStatusResponseDto: modifiedGraphGetSiteStatusResponseDto,
    } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, status: siteStatus });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(modifiedPath)
      .mockSuccessfulExpandCallWithExpandString(modifiedExpand)
      .mockSuccessfulFilterCallWithFilterString(modifiedFilter)
      .mockSuccessfulGraphGetCall(modifiedGraphGetSiteStatusResponseDto);

    const { status, body } = await api.get(`/api/v1/sites?exporterName=${modifiedSiteStatusByExporterNameQueryDto.exporterName}`);

    expect(status).toBe(expectedStatusCode);
    expect(body).toStrictEqual(modifiedSiteStatusByExporterNameResponse);
  });

  it('returns 404 with an empty object response if the site does not exist in sharepoint', async () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await api.get(getSiteStatusByExporterNameUrl({}));

    expect(status).toBe(404);
    expect(body).toStrictEqual({});
  });

  it('returns a 400 with validation rules if request does not meet validation rules', async () => {
    const incorrectQueryName = 'IncorrectQueryName';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await api.get(getSiteStatusByExporterNameUrl({ queryName: incorrectQueryName }));

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: [
        `property ${incorrectQueryName} should not exist`,
        'exporterName must be a string',
        'exporterName must be longer than or equal to 0 characters',
      ],
      statusCode: 400,
    });
  });

  const getSiteStatusByExporterNameUrl = ({
    queryName = 'exporterName',
    queryValue = siteStatusByExporterNameQueryDto.exporterName,
  }: {
    queryName?: string;
    queryValue?: string;
  }) => {
    return `/api/v1/sites?${queryName}=${queryValue}`;
  };
});
