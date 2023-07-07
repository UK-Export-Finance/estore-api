import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { GraphService } from '../graph/graph.service';
import { MdmService } from '../mdm/mdm.service';
import { SiteService } from './site.service';

jest.mock('../graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const tfisSharepointUrl = valueGenerator.string();
  const tfisCaseSitesListId = valueGenerator.string();
  const maskedId = valueGenerator.stringOfNumericCharacters();

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
    siteService = new SiteService({ tfisSharepointUrl, tfisCaseSitesListId }, graphService, mdmService);
  });

  describe('createSiteId', () => {
    it('returns the masked id from creating a number of type 6 in MDM', async () => {
      when(mdmServiceCreateNumbers)
        .calledWith([
          {
            numberTypeId: 6,
            createdBy: 'Estore',
            requestingSystem: 'Estore',
          },
        ])
        .mockResolvedValueOnce([{ maskedId }]);

      const createdSiteId = await siteService.createSiteId();

      expect(createdSiteId).toEqual(maskedId);
    });
  });
});
