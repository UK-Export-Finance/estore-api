import { Api } from '@ukef-test/support/api';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { MockMockSiteIdGeneratorService } from '@ukef-test/support/mocks/mockSiteIdGenerator.service.mock';
import { resetAllWhenMocks } from 'jest-when';

describe('createSite', () => {
  const valueGenerator = new RandomValueGenerator();

  let api: Api;
  let mockGraphClientService: MockGraphClientService;
  let mockMockSiteIdGeneratorService: MockMockSiteIdGeneratorService;

  beforeAll(async () => {
    ({ api, mockGraphClientService, mockMockSiteIdGeneratorService } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterAll(async () => {
    await api.destroy();
  });

  // withClientAuthenticationTests({
  //   givenTheRequestWouldOtherwiseSucceed: () => {
  //     mockGraphClientService
  //       .mockSuccessfulGraphApiCallWithPath(path)
  //       .mockSuccessfulExpandCallWithExpandString(expand)
  //       .mockSuccessfulFilterCallWithFilterString(filter)
  //       .mockSuccessfulGraphGetCall(graphGetSiteStatusResponseDto);
  //   },
  //   makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
  //     api.getWithoutAuth(`/api/v1/sites?exporterName=${siteStatusByExporterNameQueryDto.exporterName}`,
  //incorrectAuth?.headerName, incorrectAuth?.headerValue),
  // });

  // withCommonGraphExceptionHandlingTests({
  //   givenRequestWouldOtherwiseSucceed: () => {
  //     mockGraphClientService.mockSuccessfulGraphApiCallWithPath(path);
  //   },
  //   givenGraphServiceCallWillThrowError: (error: Error) => {
  //     mockGraphClientService.mockUnsuccessfulGraphGetCall(error);
  //   },
  //   makeRequest: () => api.post(`/api/v1/sites`, createSiteRequest[0]),
  // });

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
      siteStatusByExporterNameQueryDto: createSiteRequestItem,
      siteStatusByExporterNameResponse: createSiteResponse,
      graphServiceGetParams: { path: modifiedPath, expand: modifiedExpand, filter: modifiedFilter },
      graphGetSiteStatusResponseDto: modifiedGraphGetSiteStatusResponseDto,
    } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, status: siteStatus });

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(modifiedPath)
      .mockSuccessfulExpandCallWithExpandString(modifiedExpand)
      .mockSuccessfulFilterCallWithFilterString(modifiedFilter)
      .mockSuccessfulGraphGetCall(modifiedGraphGetSiteStatusResponseDto);

    const { status, body } = await api.post('/api/v1/sites', [createSiteRequestItem]);
    expect(status).toBe(expectedStatusCode);
    expect(body).toStrictEqual(createSiteResponse);
  });

  it('returns 202 with status Provisioning if the site does not exist in sharepoint and new site creation started', async () => {
    const { siteStatusByExporterNameQueryDto, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
      numberToGenerate: 1,
    });

    const { exporterName } = siteStatusByExporterNameQueryDto;

    const { createSiteRequest, createSiteResponse, graphServicePostParams, graphCreateSiteResponseDto } = new CreateSiteGenerator(valueGenerator).generate({
      numberToGenerate: 1,
      status: 'Provisioning',
      exporterName,
    });

    const { siteId } = createSiteResponse[0];

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path)
      .mockSuccessfulExpandCallWithExpandString(graphServiceGetParams.expand)
      .mockSuccessfulFilterCallWithFilterString(graphServiceGetParams.filter)
      .mockSuccessfulGraphGetCall({ value: [] });

    mockMockSiteIdGeneratorService.mockReturnValue(siteId);

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
      .mockSuccessfulGraphPostCall(graphServicePostParams[0].requestBody, graphCreateSiteResponseDto[0]);

    const { status, body } = await api.post('/api/v1/sites', createSiteRequest);
    expect(status).toBe(202);
    expect(body).toStrictEqual(createSiteResponse[0]);
  });

  it('returns a 400 with validation rules if request does not meet validation rules', async () => {
    const { status, body } = await api.post('/api/v1/sites', [{}]);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: [
        'exporterName must be a string',
        'exporterName must be longer than or equal to 1 characters',
        'exporterName must match /^[A-Za-z\\d-._()\\s]+$/ regular expression',
      ],
      statusCode: 400,
    });
  });

  it('returns a 400 with validation rules if request does not meet validation rules, ignores extra field', async () => {
    const { status, body } = await api.post('/api/v1/sites', [{ incorrectFieldName: valueGenerator.word() }]);

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: [
        'exporterName must be a string',
        'exporterName must be longer than or equal to 1 characters',
        'exporterName must match /^[A-Za-z\\d-._()\\s]+$/ regular expression',
      ],
      statusCode: 400,
    });
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
