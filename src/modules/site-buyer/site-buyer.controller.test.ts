import { BadRequestException } from '@nestjs/common/exceptions';
import { ENUMS } from '@ukef/constants';
import { CreateBuyerFolderGenerator } from '@ukef-test/support/generator/create-buyer-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Response } from 'express';
import { when } from 'jest-when';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianException } from '../custodian/exception/custodian.exception';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { BuyerFolderCreationService } from './buyer-folder-creation.service';
import { SiteExporterInvalidException } from './exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from './exception/site-exporter-not-found.exception';
import { SiteBuyerController } from './site-buyer.controller';

describe('SiteBuyerController', () => {
  const valueGenerator = new RandomValueGenerator();

  const { siteId, createBuyerFolderRequest } = new CreateBuyerFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  describe('createBuyerFolder', () => {
    const buyerName = createBuyerFolderRequest[0].buyerName;
    const caseSiteId = valueGenerator.nonnegativeInteger();
    const notEmptyFolderInSharepointResponse = [{ fields: { id: valueGenerator.integer() } }];
    const emptyFolderInSharepointResponse = [];

    const res: Response = {
      status: jest.fn().mockReturnThis(),
    } as any;

    let serviceCreateBuyerFolder: jest.Mock;
    let getCaseSiteId: jest.Mock;
    let sharepointServiceGetBuyerFolder: jest.Mock;

    let sharepointServiceGetFolderInSharepointApiResponse: jest.Mock;
    let custodianServiceGetApiResponseIfFolderInCustodian: jest.Mock;
    let controller: SiteBuyerController;

    beforeEach(() => {
      serviceCreateBuyerFolder = jest.fn();
      getCaseSiteId = jest.fn();
      const buyerFolderService = new BuyerFolderCreationService(null, null, null, null);
      buyerFolderService.createBuyerFolder = serviceCreateBuyerFolder;
      buyerFolderService.getCaseSiteId = getCaseSiteId;

      sharepointServiceGetBuyerFolder = jest.fn();
      sharepointServiceGetFolderInSharepointApiResponse = jest.fn();
      const sharepointService = new SharepointService(null, null);
      sharepointService.getBuyerFolder = sharepointServiceGetBuyerFolder;
      sharepointService.getFolderInSharepointApiResponse = sharepointServiceGetFolderInSharepointApiResponse;

      custodianServiceGetApiResponseIfFolderInCustodian = jest.fn();
      const custodianService = new CustodianService(null, null, null, null, null);
      custodianService.getApiResponseIfFolderInCustodian = custodianServiceGetApiResponseIfFolderInCustodian;

      controller = new SiteBuyerController(buyerFolderService, sharepointService, custodianService);
    });

    it('returns the buyer name as folder of the folder that was created', async () => {
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);
      when(getCaseSiteId).calledWith(siteId).mockResolvedValueOnce({ caseSiteId });
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(caseSiteId, buyerName, res).mockResolvedValueOnce(null);
      when(serviceCreateBuyerFolder).calledWith(siteId, caseSiteId, buyerName).mockResolvedValueOnce(buyerName);

      const apiResponse = await controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      expect(apiResponse).toStrictEqual({ folderName: buyerName, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });
    });

    it('throws the original error if creating the buyer folder throws a SiteExporterNotFoundException', async () => {
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);

      const errorMessage = valueGenerator.string();
      const folderDependencyNotFound = new SiteExporterNotFoundException(errorMessage);
      when(getCaseSiteId).calledWith(siteId).mockRejectedValueOnce(folderDependencyNotFound);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(SiteExporterNotFoundException);
      await expect(createBuyerFolderPromise).rejects.toThrow(errorMessage);
      await expect(createBuyerFolderPromise).rejects.toBe(folderDependencyNotFound);
    });

    it('throws the original error if creating the buyer folder throws an a SiteExporterInvalidException', async () => {
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);

      const errorMessage = valueGenerator.string();
      const folderDependencyInvalidException = new SiteExporterInvalidException(errorMessage);
      when(getCaseSiteId).calledWith(siteId).mockRejectedValueOnce(folderDependencyInvalidException);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(SiteExporterInvalidException);
      await expect(createBuyerFolderPromise).rejects.toThrow(errorMessage);
      await expect(createBuyerFolderPromise).rejects.toBe(folderDependencyInvalidException);
    });

    it('throws the original error if creating the buyer folder throws an exception that is not a SiteExporterNotFoundException', async () => {
      when(getCaseSiteId).calledWith(siteId).mockResolvedValueOnce({ caseSiteId });
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(caseSiteId, buyerName, res).mockResolvedValueOnce(null);

      const errorMessage = valueGenerator.string();
      const error = new Error(errorMessage);
      when(serviceCreateBuyerFolder).calledWith(siteId, caseSiteId, buyerName).mockRejectedValueOnce(error);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(Error);
      await expect(createBuyerFolderPromise).rejects.toThrow(errorMessage);
      await expect(createBuyerFolderPromise).rejects.toBe(error);
    });

    it('throws BadRequestException if we are still sending job to Custodian, someone is calling API too frequently', async () => {
      when(getCaseSiteId).calledWith(siteId).mockResolvedValueOnce({ caseSiteId });
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);

      const message = valueGenerator.string();
      const exception = new BadRequestException(message);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(caseSiteId, buyerName, res).mockRejectedValueOnce(exception);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(createBuyerFolderPromise).rejects.toThrow(message);
      await expect(createBuyerFolderPromise).rejects.toBe(exception);
    });

    it('throws CustodianException if getting job from Custodian fails', async () => {
      when(getCaseSiteId).calledWith(siteId).mockResolvedValueOnce({ caseSiteId });
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);

      const message = valueGenerator.string();
      const exception = new CustodianException(message);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(caseSiteId, buyerName, res).mockRejectedValueOnce(exception);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(CustodianException);
      await expect(createBuyerFolderPromise).rejects.toThrow(message);
      await expect(createBuyerFolderPromise).rejects.toBe(exception);
    });

    it('returns status EXISTS_IN_SHAREPOINT if get sharepoint folder returns not empty array', async () => {
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(notEmptyFolderInSharepointResponse);
      when(sharepointServiceGetFolderInSharepointApiResponse)
        .calledWith(buyerName, res)
        .mockResolvedValueOnce({ folderName: buyerName, status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT });

      const apiResponse = await controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      expect(apiResponse).toStrictEqual({ folderName: buyerName, status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT });
    });

    it.each([
      {
        description: `returns status CUSTODIAN_JOB_NOT_READABLE_YET if we have job request id, but custodian api don't return this job`,
        status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET,
      },
      {
        description: `returns status CUSTODIAN_JOB_NOT_STARTED if job from custodian has no start date`,
        status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_STARTED,
      },
      {
        description: `returns status CUSTODIAN_JOB_STARTED if job from custodian has start date`,
        status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED,
      },
      {
        description: `returns status CUSTODIAN_JOB_COMPLETED if job from custodian has completion date`,
        status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_COMPLETED,
      },
      {
        description: `returns status CUSTODIAN_JOB_FAILED if we have job request id, but custodian api failed`,
        status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED,
      },
    ])('$description', async ({ status }) => {
      when(sharepointServiceGetBuyerFolder).calledWith({ siteId, buyerName }).mockResolvedValueOnce(emptyFolderInSharepointResponse);
      when(getCaseSiteId).calledWith(siteId).mockResolvedValueOnce({ caseSiteId });
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(caseSiteId, buyerName, res).mockResolvedValueOnce({ folderName: buyerName, status });

      const apiResponse = await controller.createBuyerFolder({ siteId }, createBuyerFolderRequest, res);

      expect(apiResponse).toStrictEqual({ folderName: buyerName, status });
    });
  });
});
