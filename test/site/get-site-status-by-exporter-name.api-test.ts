import { withCommonGraphExceptionHandlingTests } from '@ukef-test/common/withCommonGraphExceptionHandlingTests';
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
    makeRequest: () => api.get(`/api/v1/sites?exporterName=${siteStatusByExporterNameQueryDto.exporterName}`),
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
    const { siteStatusByExporterNameQueryDto, siteStatusByExporterNameResponse, graphServiceGetParams, graphGetSiteStatusResponseDto } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, status: siteStatus });
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall(graphGetSiteStatusResponseDto);

    const { status, body } = await api.get(`/api/v1/sites?exporterName=${siteStatusByExporterNameQueryDto.exporterName}`);

    expect(status).toBe(expectedStatusCode);
    expect(body).toStrictEqual(siteStatusByExporterNameResponse);
  });

  it('returns 404 with an empty object response if the site does not exist in sharepoint', async () => {
    const { siteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
      numberToGenerate: 1,
    });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await api.get(`/api/v1/sites?exporterName=${siteStatusByExporterNameQueryDto.exporterName}`);

    expect(status).toBe(404);
    expect(body).toStrictEqual({});
  });

  it('returns a 400 with validation rules if request does not meet validation rules', async () => {
    const { siteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
      numberToGenerate: 1,
    });

    const incorrectQueryName = 'IncorrectQueryName';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    const { status, body } = await api.get(`/api/v1/sites?${incorrectQueryName}=${siteStatusByExporterNameQueryDto.exporterName}`);

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
});
