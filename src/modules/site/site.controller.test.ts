import { ENUMS } from '@ukef/constants';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { when } from 'jest-when';

import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

describe('SiteController', () => {
  const valueGenerator = new RandomValueGenerator();
  const siteService = new SiteService(null, null, null);

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
        status: ENUMS.SITE_STATUSES.FAILED,
        expectedStatusCode: HttpStatusCode.FailedDependency,
      },
      {
        status: ENUMS.SITE_STATUSES.PROVISIONING,
        expectedStatusCode: HttpStatusCode.Accepted,
      },
      {
        status: ENUMS.SITE_STATUSES.CREATED,
        expectedStatusCode: HttpStatusCode.Ok,
      },
    ])('returns a status code of $expectedStatusCode and the expected response if site status is "$status"', async ({ status, expectedStatusCode }) => {
      const modifiedSiteStatusByExporterNameResponse = { ...siteStatusByExporterNameResponse, status };

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(siteStatusByExporterNameServiceRequest).mockResolvedValueOnce(modifiedSiteStatusByExporterNameResponse);

      await siteController.getSiteStatusByExporterName(siteStatusByExporterNameQueryDto, responseMock);

      expect(responseMock.json).toHaveBeenCalledTimes(1);
      expect(responseMock.json).toHaveBeenCalledWith(modifiedSiteStatusByExporterNameResponse);
      expect(responseMock.status).toHaveBeenCalledTimes(1);
      expect(responseMock.status).toHaveBeenCalledWith(expectedStatusCode);
    });

    it('returns the expected response if site service throws a SiteNotFoundException', async () => {
      const errorMessage = `Site not found for exporter name: ${siteStatusByExporterNameServiceRequest}`;
      const siteNotFoundError = new SiteNotFoundException(errorMessage);
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(siteStatusByExporterNameServiceRequest).mockRejectedValueOnce(siteNotFoundError);

      const responsePromise = siteController.getSiteStatusByExporterName(siteStatusByExporterNameQueryDto, responseMock);

      await expect(responsePromise).rejects.toThrow(errorMessage);
    });

    it('throws an error if site service throws an error which is not SiteNotFoundException', async () => {
      const error = new Error(`Error message`);
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(siteStatusByExporterNameServiceRequest).mockRejectedValueOnce(error);

      const responsePromise = siteController.getSiteStatusByExporterName(siteStatusByExporterNameQueryDto, responseMock);

      await expect(responsePromise).rejects.toThrow(error);
    });
  });
});
