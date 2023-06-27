import { ENUMS, EXPORTER_NAME } from '@ukef/constants';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
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
    makeRequest: () => api.get(getSiteStatusByExporterNameUrl({})),
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
    expect(body).toStrictEqual({ message: 'Not found', statusCode: 404 });
  });

  it("returns a 400 because query parameter is missing, but incorrect query parameter doesn't trigger error", async () => {
    const incorrectQueryName = 'IncorrectQueryName';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ graphGetSiteStatusResponseDto });

    const { status, body } = await api.get(getSiteStatusByExporterNameUrl({ queryName: incorrectQueryName }));

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: expect.not.arrayContaining([`property ${incorrectQueryName} should not exist`]),
      statusCode: 400,
    });
  });

  it('returns a 400 with message containing "exporterName must be longer than or equal to 1 characters" if exporterName is an empty string', async () => {
    const incorrectQueryValue = '';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ graphGetSiteStatusResponseDto });

    const { status, body } = await api.get(getSiteStatusByExporterNameUrl({ queryValue: incorrectQueryValue }));

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: expect.arrayContaining([`exporterName must be longer than or equal to 1 characters`]),
      statusCode: 400,
    });
  });

  it('returns a 400 with message containing "exporterName must be shorter than or equal to 250 characters" if exporterName is too long', async () => {
    const incorrectQueryValue =
      'This is a valid regex expression that is 251 characters long. ' +
      'Lorem ipsum dolor sit amet consectetur adipiscing elit. Aenean ' +
      'dapibus erat ac eros tincidunt a commodo nunc vulputate. Donec ' +
      'ut aliquam lacus luctus augue. Pellentesque lorem eros faucibus.';

    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ graphGetSiteStatusResponseDto });

    const { status, body } = await api.get(getSiteStatusByExporterNameUrl({ queryValue: incorrectQueryValue }));

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: expect.arrayContaining([`exporterName must be shorter than or equal to 250 characters`]),
      statusCode: 400,
    });
  });

  it(`returns a 400 with message containing "exporterName must match ${EXPORTER_NAME.REGEX} regular expression" if exporterName contains invalid characters`, async () => {
    const incorrectQueryValue = siteStatusByExporterNameQueryDto.exporterName + '{}';
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ graphGetSiteStatusResponseDto });

    const { status, body } = await api.get(getSiteStatusByExporterNameUrl({ queryValue: incorrectQueryValue }));

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: expect.arrayContaining([`exporterName must match ${EXPORTER_NAME.REGEX} regular expression`]),
      statusCode: 400,
    });
  });

  it('returns a 400 with message containing the validation parameters of the query if no query is present', async () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(path)
      .mockSuccessfulExpandCallWithExpandString(expand)
      .mockSuccessfulFilterCallWithFilterString(filter)
      .mockSuccessfulGraphGetCall({ graphGetSiteStatusResponseDto });

    const { status, body } = await api.get('/api/v1/sites');

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: expect.arrayContaining(['exporterName must be longer than or equal to 1 characters', 'exporterName must be a string']),
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
