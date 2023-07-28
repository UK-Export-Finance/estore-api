import { GraphService } from '@ukef/modules/graph/graph.service';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { MdmService } from '../mdm/mdm.service';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { SiteService } from './site.service';

jest.mock('../graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const maskedId = valueGenerator.stringOfNumericCharacters();

  let siteService: SiteService;
  let mdmServiceCreateNumbers: jest.Mock;

  beforeEach(() => {
    const sharepointService = new SharepointService(null, null);

    mdmServiceCreateNumbers = jest.fn();
    const mdmService = new MdmService(null);
    mdmService.createNumbers = mdmServiceCreateNumbers;
    siteService = new SiteService(sharepointService, mdmService);
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
