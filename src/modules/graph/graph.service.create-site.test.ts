import { GraphError } from '@microsoft/microsoft-graph-client';
import { TermsFacilityExistsException } from '@ukef/modules/terms/exception/terms-facility-exists.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { withSharedGraphExceptionHandlingTests } from './graph.test-parts/with-shared-graph-exception-handling-tests';
import { getCallExpectations } from './graph.test-parts/get-call-expectations-test-parts';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const tfisSharepointUrl = valueGenerator.word();
  const tfisCaseSitesListId = valueGenerator.word();

  const mockGraphClientService = new MockGraphClientService();

  const expectedPostResponse = valueGenerator.string();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService, { tfisSharepointUrl, tfisCaseSitesListId });
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  // TODO apim-472 split these tests into descrete files
  describe('createSite', () => {
    it('returns the expected response', async () => {
        const expectedPath = `${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`;
      const exporterName = valueGenerator.exporterName();
      const siteId = valueGenerator.ukefSiteId();
      const requestBody = {
        fields: {
          Title: exporterName,
          URL: siteId,
          HomePage: exporterName,
          Description: exporterName,
        },
      };
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(`${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`)
        .mockSuccessfulGraphPostCallWithRequestBody(requestBody, expectedPostResponse);

      const result = await graphService.createSite({ exporterName, newSiteId: siteId });

      const expectations = getCallExpectations({
        mockGraphClientService,
        apiCalledWith: expectedPath,
        postCalledWith: requestBody,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedPostResponse);
    });
  });
});
