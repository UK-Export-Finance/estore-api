
import { GraphService } from '@ukef/modules/graph/graph.service';
import { MdmService } from '@ukef/modules/mdm/mdm.service';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';

import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteService } from './site.service';
import { SharepointService } from '../sharepoint/sharepoint.service';

jest.mock('@ukef/modules/graph/graph.service');

describe('SiteService', () => {
  const valueGenerator = new RandomValueGenerator();

  const tfisSharepointUrl = valueGenerator.word();
  const tfisCaseSitesListId = valueGenerator.word();

  let getSiteByExporterName: jest.Mock;

  let siteService: SiteService;

  beforeEach(() => {
    getSiteByExporterName = jest.fn();
    const sharepointService = new SharepointService(null, null);
    sharepointService.getSiteByExporterName = getSiteByExporterName;
    
    const mdmService = new MdmService(null);
    siteService = new SiteService(sharepointService, mdmService);
    resetAllWhenMocks();
  });

  describe('getSiteStatusByExporterName', () => {
    const {
      siteServiceGetSiteStatusByExporterNameRequest,
      siteStatusByExporterNameResponse,
      sharepointServiceGetSiteByExporterNameParams,
      sharepointServiceGetSiteByExporterNameResponse,
    } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1, tfisSharepointUrl, tfisCaseSitesListId });

    it('returns the site id and status from the service', async () => {
      when(getSiteByExporterName).calledWith(sharepointServiceGetSiteByExporterNameParams).mockResolvedValueOnce(sharepointServiceGetSiteByExporterNameResponse);

      const response = await siteService.getSiteStatusByExporterName(siteServiceGetSiteStatusByExporterNameRequest);

      expect(response).toEqual(siteStatusByExporterNameResponse);
    });

    it('throws a SiteNotFoundException if the site does not exist', async () => {
      when(getSiteByExporterName).calledWith(sharepointServiceGetSiteByExporterNameParams).mockResolvedValueOnce( [] );

      await expect(siteService.getSiteStatusByExporterName(siteServiceGetSiteStatusByExporterNameRequest)).rejects.toThrow(
        new SiteNotFoundException(`Site not found for exporter name: ${siteServiceGetSiteStatusByExporterNameRequest}`),
      );
    });
  });
});
