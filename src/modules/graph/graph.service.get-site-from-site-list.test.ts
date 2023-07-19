import { GraphError } from '@microsoft/microsoft-graph-client';
import { TermsFacilityExistsException } from '@ukef/modules/terms/exception/terms-facility-exists.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

import GraphService from './graph.service';
import { withSharedGraphExceptionHandlingTests } from './graph.test-parts/with-shared-graph-exception-handling-tests';
import { getCallExpectations } from './graph.test-parts/get-call-expectations-test-parts';
import exp from 'constants';

describe('GraphService', () => {
  const valueGenerator = new RandomValueGenerator();
  let graphService: GraphService;

  const tfisSharepointUrl = valueGenerator.word();
  const tfisCaseSitesListId = valueGenerator.word();

  const mockGraphClientService = new MockGraphClientService();

  beforeEach(() => {
    graphService = new GraphService(mockGraphClientService, { tfisSharepointUrl, tfisCaseSitesListId });
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  // TODO apim-472 can these tests hitting list be combined?
  describe('getSiteFromSiteListByExporterName', () => {
    it('returns the list items for the site matching the given filter using GraphService', async () => {
      const exporterName = valueGenerator.exporterName();
      const expectedPath = `${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`;
        const expectedFilterString = `fields/Title eq '${exporterName}'`;
        const expectedExpandString = `fields($select=Title,URL,Sitestatus)`;

      const expectedResponse = valueGenerator.string();

      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(`${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`)
        .mockSuccessfulFilterCallWithFilterString(`fields/Title eq '${exporterName}'`)
        .mockSuccessfulExpandCallWithExpandString(`fields($select=Title,URL,Sitestatus)`)
        .mockSuccessfulGraphGetCall({ value: expectedResponse });

      const result = await graphService.getSiteFromSiteListByExporterName(exporterName);

      const expectations = getCallExpectations({
        mockGraphClientService,
        apiCalledWith: expectedPath,
        filterCalledWith: expectedFilterString,
        expandCalledWith: expectedExpandString,
        getCalled: true,
      });
      expectations.forEach((expectation) => expectation());

      expect(result).toEqual(expectedResponse);
    });
  });
});
