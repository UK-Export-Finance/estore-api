import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { GraphService } from '../graph/graph.service';
import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';

jest.mock('../graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const ukefSharepointName = ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME;
  const tfisSiteName = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME;
  const tfisListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_LIST_ID;

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
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1 });

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
