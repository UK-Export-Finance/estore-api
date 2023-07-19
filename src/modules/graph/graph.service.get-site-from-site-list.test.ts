import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { withGetMethodTests } from './graph.test-parts/with-get-method-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const tfisSharepointUrl = valueGenerator.word();
  const tfisCaseSitesListId = valueGenerator.word();
  const tfisFacilityHiddenListTermStoreId = valueGenerator.word();

  const mockGraphClientService = new MockGraphClientService();

  const exporterName = valueGenerator.exporterName();
  const response = valueGenerator.string();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService, { tfisSharepointUrl, tfisCaseSitesListId, tfisFacilityHiddenListTermStoreId });
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  // TODO apim-472 can these tests hitting list be combined?
  describe('getSiteFromSiteListByExporterName', () => {
    withGetMethodTests({
      mockGraphClientService,
      path: `${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`,
      filterString: `fields/Title eq '${exporterName}'`,
      expandString: `fields($select=Title,URL,Sitestatus)`,
      getResponse: { value: response },
      methodResponse: response,
      makeRequest: () => graphService.getSiteFromSiteListByExporterName(exporterName),
    });
  });
});
