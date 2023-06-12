import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { SiteController } from './site.controller';
import { SiteService } from './site.service';

describe('SiteController', () => {
  const valueGenerator = new RandomValueGenerator();

  const siteService = new SiteService(null, null);

  const siteGetSiteStatusByExporterName = jest.fn();
  siteService.getSiteStatusByExporterName = siteGetSiteStatusByExporterName;

  let siteController: SiteController;

  beforeEach(() => {
    siteGetSiteStatusByExporterName.mockReset();

    siteController = new SiteController(siteService);
  });

  describe('getSiteStatusByExporterName', () => {
    const { siteStatusByExporterNameQueryDto, siteStatusByExporterNameServiceRequest, siteStatusByExporterNameResponse } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1 });

    it('returns the site name and status from the service', async () => {
      when(siteGetSiteStatusByExporterName).calledWith(siteStatusByExporterNameServiceRequest).mockResolvedValueOnce(siteStatusByExporterNameResponse);

      const response = await siteController.getSiteStatusByExporterName(siteStatusByExporterNameQueryDto);

      expect(response).toEqual(siteStatusByExporterNameResponse);
    });
  });
});
