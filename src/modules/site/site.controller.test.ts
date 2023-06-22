import { ENUMS } from '@ukef/constants';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { when } from 'jest-when';

import { MdmException } from '../mdm/exception/mdm.exception';
import { SiteIdCreationFailedException } from './exception/site-id-creation-failed.exception';
import { SiteNotFoundException } from './exception/site-not-found.exception';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

describe('SiteController', () => {
  const valueGenerator = new RandomValueGenerator();
  const siteService = new SiteService(null, null, null);

  let siteController: SiteController;

  const siteGetSiteStatusByExporterName = jest.fn();
  siteService.getSiteStatusByExporterName = siteGetSiteStatusByExporterName;

  const siteCreateSite = jest.fn();
  siteService.createSite = siteCreateSite;

  const siteCreateSiteId = jest.fn();
  siteService.createSiteId = siteCreateSiteId;

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

  describe('createSite', () => {
    const { siteStatusByExporterNameResponse } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1 });

    const { createSiteRequest, createSiteResponse } = new CreateSiteGenerator(valueGenerator).generate({ numberToGenerate: 1 });
    const exporterName = createSiteRequest[0].exporterName;
    const siteId = createSiteResponse[0].siteId;

    it.each([
      {
        status: 'Failed',
        expectedStatusCode: HttpStatusCode.FailedDependency,
      },
      {
        status: 'Provisioning',
        expectedStatusCode: HttpStatusCode.Accepted,
      },
      {
        status: 'Created',
        expectedStatusCode: HttpStatusCode.Ok,
      },
    ])('returns a status code of $expectedStatusCode and the expected response if site status is "$status"', async ({ status, expectedStatusCode }) => {
      // Same behaviour as GET /sites endpoint
      const modifiedSiteStatusByExporterNameResponse = { ...siteStatusByExporterNameResponse, status };

      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(exporterName).mockResolvedValueOnce(modifiedSiteStatusByExporterNameResponse);

      await siteController.createSite(createSiteRequest, responseMock);

      expect(responseMock.json).toHaveBeenCalledTimes(1);
      expect(responseMock.json).toHaveBeenCalledWith(modifiedSiteStatusByExporterNameResponse);
      expect(responseMock.status).toHaveBeenCalledTimes(1);
      expect(responseMock.status).toHaveBeenCalledWith(expectedStatusCode);
    });

    it('calls create site and returns a status code 202 if site service throws a SiteNotFoundException', async () => {
      const siteNotFoundError = new SiteNotFoundException(`Site not found for exporter name: ${exporterName}`);
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(exporterName).mockRejectedValueOnce(siteNotFoundError);
      when(siteCreateSiteId).calledWith().mockReturnValue(siteId);
      when(siteCreateSite).calledWith(exporterName, siteId).mockResolvedValueOnce(createSiteResponse[0]);

      await siteController.createSite(createSiteRequest, responseMock);

      expect(siteCreateSite).toHaveBeenCalledTimes(1);
      expect(responseMock.json).toHaveBeenCalledTimes(1);
      expect(responseMock.json).toHaveBeenCalledWith({
        siteId: siteId,
        status: 'Provisioning',
      });
      expect(responseMock.status).toHaveBeenCalledTimes(1);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatusCode.Accepted);
    });

    it('throws an error if site service throws an error which is not SiteNotFoundException', async () => {
      const error = new Error(`Error message`);
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(exporterName).mockRejectedValueOnce(error);

      const responsePromise = siteController.createSite(createSiteRequest, responseMock);

      await expect(responsePromise).rejects.toThrow(error);
    });

    it('throws error SiteIdCreationFailedException if site service throws MdmException', async () => {
      const siteNotFoundError = new SiteNotFoundException(`Site not found for exporter name: ${exporterName}`);
      const mdmError = new MdmException('Error message');
      const expectedFinalError = new SiteIdCreationFailedException('Failed to create a site ID');
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      when(siteGetSiteStatusByExporterName).calledWith(exporterName).mockRejectedValueOnce(siteNotFoundError);
      when(siteCreateSiteId).calledWith().mockRejectedValueOnce(mdmError);

      const responsePromise = siteController.createSite(createSiteRequest, responseMock);

      await expect(responsePromise).rejects.toThrow(expectedFinalError);
    });
  });
});
