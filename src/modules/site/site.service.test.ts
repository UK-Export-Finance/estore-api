import { GraphService } from '@ukef/modules/graph/graph.service';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const ukefSharepointName = valueGenerator.string();
  const tfisSiteName = valueGenerator.string();
  const tfisListId = valueGenerator.string();

  let graphService: GraphService;

  let siteService: SiteService;
  let graphServiceGetRequest: jest.Mock;
  let graphServicePostRequest: jest.Mock;

  beforeEach(() => {
    graphService = new GraphService(null);
    siteService = new SiteService({ ukefSharepointName, tfisSiteName, tfisListId }, graphService);

    graphServiceGetRequest = jest.fn();
    graphService.get = graphServiceGetRequest;

    graphServicePostRequest = jest.fn();
    graphService.post = graphServicePostRequest;
  });

  describe('getSiteStatusByExporterName', () => {
    const { siteStatusByExporterNameServiceRequest, siteStatusByExporterNameResponse, graphServiceGetParams, graphGetSiteStatusResponseDto } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, ukefSharepointName, tfisSiteName, tfisListId });

    it('returns the site id and status from the service', async () => {
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

  describe('createSite', () => {
    const { createSiteRequest, createSiteResponse, graphServicePostParams, graphCreateSiteResponseDto } = new CreateSiteGenerator(valueGenerator).generate({
      numberToGenerate: 1,
      ukefSharepointName,
      tfisSiteName,
      tfisListId,
    });

    const exporterName = createSiteRequest[0].exporterName;
    const siteId = createSiteResponse[0].siteId;

    it('returns the site id and status from the service', async () => {
      when(graphServicePostRequest).calledWith(graphServicePostParams[0]).mockResolvedValueOnce(graphCreateSiteResponseDto[0]);

      const response = await siteService.createSite(exporterName, siteId);

      expect(response).toEqual(createSiteResponse[0]);
    });
  });
});
