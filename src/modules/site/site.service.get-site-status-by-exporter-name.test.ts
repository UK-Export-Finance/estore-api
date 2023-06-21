import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { GraphService } from '../graph/graph.service';
import { MdmService } from '../mdm/mdm.service';
import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';

jest.mock('../graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const ukefSharepointName = valueGenerator.string();
  const tfisSiteName = valueGenerator.string();
  const tfisListId = valueGenerator.string();

  let siteService: SiteService;
  let graphServiceGetRequest: jest.Mock;
  let mdmServiceCreateNumbers: jest.Mock;

  beforeEach(() => {
    graphServiceGetRequest = jest.fn();
    const graphService = new GraphService(null);
    graphService.get = graphServiceGetRequest;

    mdmServiceCreateNumbers = jest.fn();
    const mdmService = new MdmService(null);
    mdmService.createNumbers = mdmServiceCreateNumbers;
    siteService = new SiteService({ ukefSharepointName, tfisSiteName, tfisListId }, graphService, mdmService);
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
