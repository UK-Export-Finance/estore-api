import { GraphService } from '@ukef/modules/graph/graph.service';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const ukefSharepointName = valueGenerator.word() + '.sharepoint.com';
  const tfisSiteName = valueGenerator.word();
  const tfisListId = valueGenerator.word();

  let graphService: GraphService;

  let siteService: SiteService;
  let graphServiceGetRequest: jest.Mock;

  beforeEach(() => {
    graphService = new GraphService(null);
    siteService = new SiteService({ ukefSharepointName, tfisSiteName, tfisListId }, graphService);

    graphServiceGetRequest = jest.fn();
    graphService.get = graphServiceGetRequest;
    resetAllWhenMocks();
  });

  describe('getSiteStatusByExporterName', () => {
    const { siteStatusByExporterNameServiceRequest, siteStatusByExporterNameResponse, graphServiceGetParams, graphGetSiteStatusResponseDto } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, ukefSharepointName, tfisSiteName, tfisListId });

    it('returns the site name and status from the service', async () => {
      when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce(graphGetSiteStatusResponseDto);

      const response = await siteService.getSiteStatusByExporterName(siteStatusByExporterNameServiceRequest);

      expect(response).toEqual(siteStatusByExporterNameResponse);
    });

    it('throws a SiteNotFoundException if the site does not exist', async () => {
      when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce({ value: [] });

      await expect(siteService.getSiteStatusByExporterName(siteStatusByExporterNameServiceRequest)).rejects.toThrow(
        new SiteNotFoundException(`Site not found for exporter name: ${siteStatusByExporterNameServiceRequest}`),
      );
    });
  });
});
