import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { withPostMethodTests } from './graph.test-parts/with-post-method-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const tfisSharepointUrl = valueGenerator.word();
  const tfisCaseSitesListId = valueGenerator.word();
  const tfisFacilityHiddenListTermStoreId = valueGenerator.word();

  const mockGraphClientService = new MockGraphClientService();

  const response = valueGenerator.string();

  const exporterName = valueGenerator.exporterName();
  const newSiteId = valueGenerator.ukefSiteId();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService, { tfisSharepointUrl, tfisCaseSitesListId, tfisFacilityHiddenListTermStoreId });
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('createSite', () => {
    withPostMethodTests({
      mockGraphClientService,
      path: `${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`,
      requestBody: {
        fields: {
          Title: exporterName,
          URL: newSiteId,
          HomePage: exporterName,
          Description: exporterName,
        },
      },
      postResponse: response,
      methodResponse: response,
      makeRequest: () => graphService.createSite({ exporterName, newSiteId }),
    });
  });
});
