import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

describe('SiteController', () => {
  const valueGenerator = new RandomValueGenerator();
  const siteService = new SiteService(null, null);

  let siteController: SiteController;

  const siteGetSiteStatusByExporterName = jest.fn();
  siteService.getSiteStatusByExporterName = siteGetSiteStatusByExporterName;

  beforeEach(() => {
    siteGetSiteStatusByExporterName.mockReset();
    siteController = new SiteController(siteService);
  });

  describe('getSiteStatusByExporterName', () => {
    const { siteStatusByExporterNameQueryDto, siteStatusByExporterNameServiceRequest, siteStatusByExporterNameResponse } =
      new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1 });

    it.each([
      {
        status: 'Failed',
        expectedStatusCode: 424,
      },
      {
        status: 'Provisioning',
        expectedStatusCode: 202,
      },
      {
        status: 'Created',
        expectedStatusCode: 200,
      },
    ])('returns a status code of $expectedStatusCode and the expected response if site status is "$status"', async ({ status, expectedStatusCode }) => {
      const modifiedSiteStatusByExporterNameResponse = { ...siteStatusByExporterNameResponse, status };

      const responseMock: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      when(siteGetSiteStatusByExporterName).calledWith(siteStatusByExporterNameServiceRequest).mockResolvedValueOnce(modifiedSiteStatusByExporterNameResponse);

      await siteController.getSiteStatusByExporterName(siteStatusByExporterNameQueryDto, responseMock);

      expect(responseMock.json).toHaveBeenCalledTimes(1);
      expect(responseMock.json).toHaveBeenCalledWith(modifiedSiteStatusByExporterNameResponse);
      expect(responseMock.status).toHaveBeenCalledTimes(1);
      expect(responseMock.status).toHaveBeenCalledWith(expectedStatusCode);
    });

    it('returns a status code of 400 and the expected response if the site status is "Not Found"', async () => {
      const siteNotFoundError = new SiteNotFoundException(`Site not found for exporter name: ${siteStatusByExporterNameServiceRequest}`);
      const responseMock: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      when(siteGetSiteStatusByExporterName).calledWith(siteStatusByExporterNameServiceRequest).mockRejectedValueOnce(siteNotFoundError);

      await siteController.getSiteStatusByExporterName(siteStatusByExporterNameQueryDto, responseMock);

      expect(responseMock.json).toHaveBeenCalledTimes(1);
      expect(responseMock.json).toHaveBeenCalledWith({});
      expect(responseMock.status).toHaveBeenCalledTimes(1);
      expect(responseMock.status).toHaveBeenCalledWith(404);
    });
  });
});
