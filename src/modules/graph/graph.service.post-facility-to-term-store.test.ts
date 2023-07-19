import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { getCallExpectations } from './graph.test-parts/call-expectations-test-parts';
import { withPostMethodTests } from './graph.test-parts/with-post-method-tests';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const tfisSharepointUrl = valueGenerator.word();
  const tfisCaseSitesListId = valueGenerator.word();
  const tfisFacilityHiddenListTermStoreId = valueGenerator.word();

  const mockGraphClientService = new MockGraphClientService();

  const id = valueGenerator.string();
  const postResponse = valueGenerator.string();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService, { tfisSharepointUrl, tfisCaseSitesListId , tfisFacilityHiddenListTermStoreId});
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('postFacilityToTermStore', () => {
    withPostMethodTests({
        mockGraphClientService,
        path: `${tfisSharepointUrl}/lists/${tfisFacilityHiddenListTermStoreId}/items`,
        requestBody: {
          fields: {
            Title: id,
          },
        },
        postResponse,
        makeRequest: () => graphService.postFacilityToTermStore(id),
      });
      });
});
