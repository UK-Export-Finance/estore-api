import { ENUMS } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { CreateSiteResponse } from './dto/create-site-response.dto';
import { SiteService } from './site.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const tfisSharepointUrl = valueGenerator.word() + '.sharepoint.com';
  const tfisListId = valueGenerator.word();

  let siteService: SiteService;
  let graphServiceGetRequest: jest.Mock;
  let graphServicePostRequest: jest.Mock;
  let mdmServiceCreateNumbers: jest.Mock;

  beforeEach(() => {
    const graphService = new GraphService(null);
    graphServiceGetRequest = jest.fn();
    graphService.get = graphServiceGetRequest;
    graphServicePostRequest = jest.fn();
    graphService.post = graphServicePostRequest;
    const mdmService = new MdmService(null);
    mdmServiceCreateNumbers = jest.fn();
    mdmService.createNumbers = mdmServiceCreateNumbers;
    siteService = new SiteService({ tfisSharepointUrl, tfisListId }, graphService, mdmService);
    resetAllWhenMocks();
  });

  describe('createSite', () => {
    it('creates site and returns new site id and status from the service', async () => {
      const { siteServiceGetSiteStatusByExporterNameRequest, graphServiceGetParams } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
        numberToGenerate: 1,
        tfisSharepointUrl,
        tfisListId,
      });

      const exporterName = siteServiceGetSiteStatusByExporterNameRequest;

      const { createSiteResponse, graphServicePostParams, graphCreateSiteResponseDto, requestToCreateSiteId } = new CreateSiteGenerator(
        valueGenerator,
      ).generate({
        numberToGenerate: 1,
        tfisSharepointUrl,
        tfisListId,
        exporterName,
      });

      const siteId = createSiteResponse[0].siteId;
      when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce({ value: [] });
      when(mdmServiceCreateNumbers)
        .calledWith(requestToCreateSiteId)
        .mockResolvedValueOnce([{ maskedId: siteId }]);
      when(graphServicePostRequest).calledWith(graphServicePostParams[0]).mockResolvedValueOnce(graphCreateSiteResponseDto[0]);

      const response = await siteService.createSiteIfDoesNotExist(exporterName);

      expect(graphServicePostRequest).toHaveBeenCalledTimes(1);
      expect(mdmServiceCreateNumbers).toHaveBeenCalledTimes(1);
      expect(response).toEqual(createSiteResponse[0]);
    });

    it.each([
      {
        status: ENUMS.SITE_STATUSES.FAILED,
      },
      {
        status: ENUMS.SITE_STATUSES.PROVISIONING,
      },
      {
        status: ENUMS.SITE_STATUSES.CREATED,
      },
    ])('returns expected status and siteId if site status is "$status"', async ({ status }) => {
      const {
        siteServiceGetSiteStatusByExporterNameRequest: exporterName,
        graphServiceGetSiteStatusByExporterNameResponseDto,
        siteStatusByExporterNameResponse,
        graphServiceGetParams,
      } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({
        numberToGenerate: 1,
        tfisSharepointUrl,
        tfisListId,
        status,
      });
      when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce(graphServiceGetSiteStatusByExporterNameResponseDto);

      const response: CreateSiteResponse = await siteService.createSiteIfDoesNotExist(exporterName);

      expect(graphServicePostRequest).toHaveBeenCalledTimes(0);
      expect(mdmServiceCreateNumbers).toHaveBeenCalledTimes(0);
      expect(response).toEqual(siteStatusByExporterNameResponse);
    });
  });
});
