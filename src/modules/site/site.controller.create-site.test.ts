import { ENUMS } from '@ukef/constants';
import { CreateSiteGenerator } from '@ukef-test/support/generator/create-site-generator';
import { getSiteStatusByExporterNameGenerator } from '@ukef-test/support/generator/get-site-status-by-exporter-name-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { when } from 'jest-when';

import { MdmException } from '../mdm/exception/mdm.exception';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

describe('SiteController', () => {
  const valueGenerator = new RandomValueGenerator();
  const siteService = new SiteService(null, null, null);

  let siteController: SiteController;

  const siteGetSiteStatusByExporterName = jest.fn();
  siteService.getSiteStatusByExporterName = siteGetSiteStatusByExporterName;

  const siteCreateSiteIfDoesNotExist = jest.fn();
  siteService.createSiteIfDoesNotExist = siteCreateSiteIfDoesNotExist;

  beforeEach(() => {
    siteGetSiteStatusByExporterName.mockReset();
    siteController = new SiteController(siteService);
  });

  describe('createSite', () => {
    const { siteStatusByExporterNameResponse } = new getSiteStatusByExporterNameGenerator(valueGenerator).generate({ numberToGenerate: 1 });

    const { createSiteRequest } = new CreateSiteGenerator(valueGenerator).generate({ numberToGenerate: 1 });
    const exporterName = createSiteRequest[0].exporterName;

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
    ])(
      'returns a status code of $expectedStatusCode and the expected response if the created site status is "$status"',
      async ({ status, expectedStatusCode }) => {
        const modifiedSiteStatusByExporterNameResponse = { ...siteStatusByExporterNameResponse, status };

        const responseMock = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn().mockReturnThis(),
        } as unknown as Response;

        when(siteCreateSiteIfDoesNotExist).calledWith(exporterName).mockResolvedValueOnce(modifiedSiteStatusByExporterNameResponse);

        await siteController.createSite(createSiteRequest, responseMock);

        expect(responseMock.json).toHaveBeenCalledTimes(1);
        expect(responseMock.json).toHaveBeenCalledWith(modifiedSiteStatusByExporterNameResponse);
        expect(responseMock.status).toHaveBeenCalledTimes(1);
        expect(responseMock.status).toHaveBeenCalledWith(expectedStatusCode);
      },
    );

    it('throws MdmException if site service throws MdmException', async () => {
      const mdmError = new MdmException('Error message');
      //const expectedResponseError = new SiteIdCreationFailedException('Failed to create a site ID');
      const responseMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      // when(siteGetSiteStatusByExporterName).calledWith(exporterName).mockRejectedValueOnce(siteNotFoundError);
      when(siteCreateSiteIfDoesNotExist).calledWith(exporterName).mockRejectedValueOnce(mdmError);

      const responsePromise = siteController.createSite(createSiteRequest, responseMock);

      await expect(responsePromise).rejects.toThrow(mdmError);
    });
  });
});
