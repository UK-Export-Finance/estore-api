import { GraphService } from '@ukef/modules/graph/graph.service';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { SiteService } from './site.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const ukefSharepointName = valueGenerator.word() + '.sharepoint.com';
  const tfisSiteName = valueGenerator.word();
  const tfisListId = valueGenerator.word();

  let siteService: SiteService;
  let graphServicePostRequest: jest.Mock;

  beforeEach(() => {
    const graphService = new GraphService(null);
    graphServicePostRequest = jest.fn();
    graphService.post = graphServicePostRequest;
    siteService = new SiteService({ ukefSharepointName, tfisSiteName, tfisListId }, graphService, null);
    resetAllWhenMocks();
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
