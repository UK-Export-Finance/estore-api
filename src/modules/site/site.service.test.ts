import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { GraphService } from '../graph/graph.service';
import { SiteService } from './site.service';

jest.mock('../graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const ukefSharepointName = valueGenerator.string();
  const tfisSiteName = valueGenerator.string();
  const tfisListId = valueGenerator.string();

  let graphService: GraphService;

  let siteService: SiteService;
  let graphServiceGetRequest: jest.Mock;

  beforeEach(() => {
    graphService = new GraphService(null);
    siteService = new SiteService({ ukefSharepointName, tfisSiteName, tfisListId }, graphService);

    graphServiceGetRequest = jest.fn();
    graphService.get = graphServiceGetRequest;
  });

  describe('getSiteStatusByExporterName', () => {
    const { siteStatusByExporterNameServiceRequest, siteStatusByExporterNameResponse, graphServiceGetParams, graphGetSiteStatusResponseDto } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, ukefSharepointName, tfisSiteName, tfisListId });

    it('returns the site name and status from the service', async () => {
      when(graphServiceGetRequest).calledWith(graphServiceGetParams).mockResolvedValueOnce(graphGetSiteStatusResponseDto);

      const response = await siteService.getSiteStatusByExporterName(siteStatusByExporterNameServiceRequest);

      expect(response).toEqual(siteStatusByExporterNameResponse);
    });
  });
});
