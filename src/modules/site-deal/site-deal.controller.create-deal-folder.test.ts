import { BadRequestException } from '@nestjs/common/exceptions';
import { ENUMS } from '@ukef/constants';
import { CreateDealFolderGenerator } from '@ukef-test/support/generator/create-deal-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Response } from 'express';
import { when } from 'jest-when';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianException } from '../custodian/exception/custodian.exception';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { DealFolderCreationService } from './deal-folder-creation.service';
import { FolderDependencyInvalidException } from './exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';
import { FacilityFolderCreationService } from './facility-folder-creation.service';
import { SiteDealController } from './site-deal.controller';

describe('SiteDealController', () => {
  const valueGenerator = new RandomValueGenerator();

  const {
    siteId,
    createDealFolderRequestItem: { dealIdentifier, buyerName, destinationMarket, riskMarket },
    createDealFolderRequest,
  } = new CreateDealFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  describe('createDealFolder', () => {
    const folderName = `D ${dealIdentifier}`;

    let serviceCreateDealFolder: jest.Mock;

    let serviceGetBuyerFolderId: jest.Mock;
    let serviceGenerateDealFolderName: jest.Mock;
    let sharepointServiceGetDealFolder: jest.Mock;

    let sharepointServiceGetFolderInSharepointApiResponse: jest.Mock;
    let custodianServiceGetApiResponseIfFolderInCustodian: jest.Mock;
    let controller: SiteDealController;

    const res: Response = {
      status: jest.fn().mockReturnThis(),
    } as any;

    const buyerFolderId = valueGenerator.nonnegativeInteger();
    const notEmptyFolderInSharepointResponse = [{ fields: { id: valueGenerator.integer() } }];
    const emptySharepointResponse = [];

    beforeEach(() => {
      serviceCreateDealFolder = jest.fn();
      serviceGetBuyerFolderId = jest.fn();
      serviceGenerateDealFolderName = jest.fn();
      const dealFolderService = new DealFolderCreationService(null, null, null, null);
      dealFolderService.createDealFolder = serviceCreateDealFolder;
      dealFolderService.getBuyerFolderId = serviceGetBuyerFolderId;
      dealFolderService.generateDealFolderName = serviceGenerateDealFolderName;

      sharepointServiceGetDealFolder = jest.fn();
      sharepointServiceGetFolderInSharepointApiResponse = jest.fn();
      const sharepointService = new SharepointService(null, null);
      sharepointService.getDealFolder = sharepointServiceGetDealFolder;
      sharepointService.getFolderInSharepointApiResponse = sharepointServiceGetFolderInSharepointApiResponse;

      custodianServiceGetApiResponseIfFolderInCustodian = jest.fn();
      const custodianService = new CustodianService(null, null, null, null, null);
      custodianService.getApiResponseIfFolderInCustodian = custodianServiceGetApiResponseIfFolderInCustodian;

      const facilityFolderCreationService = new FacilityFolderCreationService(null, null, null, null);

      controller = new SiteDealController(facilityFolderCreationService, dealFolderService, sharepointService, custodianService);
    });

    it('returns the name of the deal folder that was created', async () => {
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockResolvedValueOnce(buyerFolderId);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(buyerFolderId, folderName, res).mockResolvedValueOnce(null);

      const response = await controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      expect(response).toStrictEqual({ folderName, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });

      expect(serviceCreateDealFolder).toHaveBeenCalledWith({
        siteId,
        dealIdentifier,
        dealFolderName: folderName,
        destinationMarket,
        riskMarket,
        buyerFolderId,
      });
    });

    it('throws the original error if get buyer folder id throws a FolderDependencyNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyNotFound = new FolderDependencyNotFoundException(errorMessage);

      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockRejectedValueOnce(folderDependencyNotFound);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(FolderDependencyNotFoundException);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(folderDependencyNotFound);
      expect(serviceCreateDealFolder).toHaveBeenCalledTimes(0);
    });

    it('throws the original error if get buyer folder id throws a FolderDependencyInvalidException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyInvalidException = new FolderDependencyInvalidException(errorMessage);
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockRejectedValueOnce(folderDependencyInvalidException);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(FolderDependencyInvalidException);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(folderDependencyInvalidException);
      expect(serviceCreateDealFolder).toHaveBeenCalledTimes(0);
    });

    it('throws the original error if creating the deal folder throws an exception that is not a FolderDependencyNotFoundException', async () => {
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockResolvedValueOnce(buyerFolderId);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(buyerFolderId, folderName, res).mockResolvedValueOnce(null);

      const errorMessage = valueGenerator.string();
      const error = new Error(errorMessage);

      when(serviceCreateDealFolder)
        .calledWith({ siteId, dealIdentifier, dealFolderName: folderName, destinationMarket, riskMarket, buyerFolderId })
        .mockRejectedValueOnce(error);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(Error);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(error);
    });

    it('returns status EXISTS_IN_SHAREPOINT if get sharepoint folder returns not empty array', async () => {
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockResolvedValueOnce(buyerFolderId);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(notEmptyFolderInSharepointResponse);
      when(sharepointServiceGetFolderInSharepointApiResponse)
        .calledWith(folderName, res)
        .mockResolvedValueOnce({ folderName, status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT });

      const apiResponse = await controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      expect(apiResponse).toStrictEqual({ folderName, status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT });

      expect(serviceCreateDealFolder).toHaveBeenCalledTimes(0);
    });

    it('throws BadRequestException if we are still sending job to Custodian, someone is calling API too frequently', async () => {
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockResolvedValueOnce(buyerFolderId);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      const message = valueGenerator.string();
      const exception = new BadRequestException(message);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(buyerFolderId, folderName, res).mockRejectedValueOnce(exception);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(createDealFolderPromise).rejects.toThrow(message);
      await expect(createDealFolderPromise).rejects.toBe(exception);

      expect(serviceCreateDealFolder).toHaveBeenCalledTimes(0);
    });

    it('throws CustodianException if getting job from Custodian fails', async () => {
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockResolvedValueOnce(buyerFolderId);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      const message = valueGenerator.string();
      const exception = new CustodianException(message);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(buyerFolderId, folderName, res).mockRejectedValueOnce(exception);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(CustodianException);
      await expect(createDealFolderPromise).rejects.toThrow(message);
      await expect(createDealFolderPromise).rejects.toBe(exception);

      expect(serviceCreateDealFolder).toHaveBeenCalledTimes(0);
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
      when(serviceGenerateDealFolderName).calledWith(dealIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetBuyerFolderId).calledWith({ siteId, buyerName }).mockResolvedValueOnce(buyerFolderId);
      when(sharepointServiceGetDealFolder)
        .calledWith({ siteId, dealFolderName: `${buyerName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(buyerFolderId, folderName, res).mockResolvedValueOnce({ folderName, status });

      const apiResponse = await controller.createDealFolder({ siteId }, createDealFolderRequest, res);

      expect(apiResponse).toStrictEqual({ folderName, status });
      expect(serviceCreateDealFolder).toHaveBeenCalledTimes(0);
    });
  });
});
