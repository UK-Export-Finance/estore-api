// * The endpoint is documented in our OpenApi specification
// * If the request does not match the validation rules, then the endpoint returns a 400 with a message explaining the issue
// * If the `exporterName` is not equal to the `Title` of any items in the sites list in Sharepoint, then the endpoint returns a 404 response
// * If the `exporterName` is equal to the `Title` of an item in the sites list in Sharepoint
// * and that item has `Sitestatus` equal to `Failed` then the endpoint returns a 424 response with the correct response body
// * If the `exporterName` is equal to the `Title` of an item in the sites list in Sharepoint
// * and that item has `Sitestatus` equal to `Provisioning` then the endpoint returns a 202 response with the correct response body
// * If the `exporterName` is equal to the `Title` of an item in the sites list in Sharepoint
// * and that item has `Sitestatus` equal to `Created` then the endpoint returns a 200 response with the correct response body

import { Api } from '@ukef-test/support/api';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/graph-client.service.mock';

describe('getSiteStatusByExporterName', () => {
  const valueGenerator = new RandomValueGenerator();

  let api: Api;
  let mockGraphClientService: MockGraphClientService;

  beforeAll(async () => {
    ({ api, mockGraphClientService } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });
  //   afterAll(async () => {
  //     await api.destroy();
  //   });

  const statusCodeTestInputs = [
    {
      siteStatus: 'Created',
      expectedStatusCode: 200,
    },
    // {
    //   siteStatus: 'Provisioning',
    //   expectedStatusCode: 202,
    // },
    // {
    //   siteStatus: 'Failed',
    //   expectedStatusCode: 424,
    // },
  ];
  it.each(statusCodeTestInputs)('returns $expectedStatusCode if graph replies with $siteStatus', async ({ siteStatus, expectedStatusCode }) => {
    const { siteStatusByExporterNameQueryDto, siteStatusByExporterNameResponse, graphServiceGetParams, graphGetSiteStatusResponseDto } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1 });
    mockGraphClientService.mockSuccessfulGraphApiCallWithPath(graphServiceGetParams.path);
    mockGraphClientService.mockSuccessfulGraphGetCall({ ...graphGetSiteStatusResponseDto, siteStatus });

    const { status, body } = await api.get(`/sites?exporterName=${siteStatusByExporterNameQueryDto.exporterName}`);

    expect(status).toBe(expectedStatusCode);
    expect(body).toStrictEqual(siteStatusByExporterNameResponse);
  });

  //   it('returns 404 with an empty object response if the site does not exist in sharepoint', async () => {});

  //   const errorTestInputs = [{
  //     graphErrorResponse:,
  //     expectedResponse: ,
  //     expectedStatusCode: 500,
  //   }]

  //   it('returns a 400 if request does not meet validation rules', async () => {});
});
