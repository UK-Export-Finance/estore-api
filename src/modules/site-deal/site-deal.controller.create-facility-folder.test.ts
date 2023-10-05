import { BadRequestException } from '@nestjs/common/exceptions';
import { ENUMS } from '@ukef/constants';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { Response } from 'express';
import { when } from 'jest-when';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianException } from '../custodian/exception/custodian.exception';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { DealFolderCreationService } from './deal-folder-creation.service';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';
import { FacilityFolderCreationService } from './facility-folder-creation.service';
import { SiteDealController } from './site-deal.controller';

describe('SiteDealController', () => {
  const valueGenerator = new RandomValueGenerator();
  const facilityFolderCreationService = new FacilityFolderCreationService(null, null, null, null);

  let controller: SiteDealController;
  let sharepointServiceGetFacilityFolder: jest.Mock;
  let sharepointServiceGetFolderInSharepointApiResponse: jest.Mock;
  let custodianServiceGetApiResponseIfFolderInCustodian: jest.Mock;

  const dealFolderCreationService = new DealFolderCreationService(null, null, null, null);

  const serviceCreateFacilityFolder = jest.fn();
  const serviceGetDealFolderName = jest.fn();
  const serviceGetFacilityFolderName = jest.fn();
  const serviceGetDealFolderId = jest.fn();
  facilityFolderCreationService.createFacilityFolder = serviceCreateFacilityFolder;
  facilityFolderCreationService.getDealFolderName = serviceGetDealFolderName;
  facilityFolderCreationService.getFacilityFolderName = serviceGetFacilityFolderName;
  facilityFolderCreationService.getDealFolderId = serviceGetDealFolderId;

  const {
    createFacilityFolderParamsDto,
    createFacilityFolderRequestItem,
    createFacilityFolderRequestDto,
    createFacilityFolderResponseDto,
    custodianCreateAndProvisionRequest,
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  const facilityIdentifier = createFacilityFolderRequestItem.facilityIdentifier;
  const dealIdentifier = createFacilityFolderParamsDto.dealId;
  const dealFolderId = custodianCreateAndProvisionRequest.ParentId;
  const siteId = createFacilityFolderParamsDto.siteId;
  const notEmptyFolderInSharepointResponse = [{ fields: { id: valueGenerator.integer() } }];
  const buyerName = createFacilityFolderRequestItem.buyerName;
  const emptySharepointResponse = [];

  const res: Response = {
    status: jest.fn().mockReturnThis(),
  } as any;

  const dealFolderName = `${buyerName}/D ${dealIdentifier}`;
  const folderName = `F ${facilityIdentifier}`;

  beforeEach(() => {
    serviceCreateFacilityFolder.mockReset();
    serviceGetDealFolderName.mockReset();
    serviceGetFacilityFolderName.mockReset();
    serviceGetDealFolderId.mockReset();

    sharepointServiceGetFacilityFolder = jest.fn();
    sharepointServiceGetFolderInSharepointApiResponse = jest.fn();
    const sharepointService = new SharepointService(null, null);
    sharepointService.getFacilityFolder = sharepointServiceGetFacilityFolder;
    sharepointService.getFolderInSharepointApiResponse = sharepointServiceGetFolderInSharepointApiResponse;

    custodianServiceGetApiResponseIfFolderInCustodian = jest.fn();
    const custodianService = new CustodianService(null, null, null, null, null);
    custodianService.getApiResponseIfFolderInCustodian = custodianServiceGetApiResponseIfFolderInCustodian;

    controller = new SiteDealController(facilityFolderCreationService, dealFolderCreationService, sharepointService, custodianService);
  });

  describe('createFacilityFolder', () => {
    it('returns the expected response with created folder name', async () => {
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockResolvedValueOnce(dealFolderId);
      when(sharepointServiceGetFacilityFolder)
        .calledWith({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(dealFolderId, folderName, res).mockResolvedValueOnce(null);

      const result = await controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      expect(result).toEqual(createFacilityFolderResponseDto);
      expect(serviceCreateFacilityFolder).toHaveBeenCalledWith(createFacilityFolderRequestItem, dealFolderId, folderName);
    });

    it('throws an error if site deal service throws an error', async () => {
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockResolvedValueOnce(dealFolderId);
      when(sharepointServiceGetFacilityFolder)
        .calledWith({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(dealFolderId, folderName, res).mockResolvedValueOnce(null);

      const error = new Error(`Error message`);
      when(serviceCreateFacilityFolder).calledWith(createFacilityFolderRequestItem, dealFolderId, folderName).mockRejectedValueOnce(error);

      const responsePromise = controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      await expect(responsePromise).rejects.toThrow(error);
    });

    it('throws the original error if get buyer folder id throws a FolderDependencyNotFoundException', async () => {
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);

      const errorMessage = valueGenerator.string();
      const folderDependencyNotFound = new FolderDependencyNotFoundException(errorMessage);

      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockRejectedValueOnce(folderDependencyNotFound);

      const responsePromise = controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      await expect(responsePromise).rejects.toBeInstanceOf(FolderDependencyNotFoundException);
      await expect(responsePromise).rejects.toThrow(errorMessage);
      await expect(responsePromise).rejects.toBe(folderDependencyNotFound);
      expect(serviceCreateFacilityFolder).toHaveBeenCalledTimes(0);
    });

    it('returns status EXISTS_IN_SHAREPOINT if get sharepoint folder returns not empty array', async () => {
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockResolvedValueOnce(dealFolderId);
      when(sharepointServiceGetFacilityFolder)
        .calledWith({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })
        .mockResolvedValueOnce(notEmptyFolderInSharepointResponse);

      when(sharepointServiceGetFolderInSharepointApiResponse)
        .calledWith(folderName, res)
        .mockResolvedValueOnce({ folderName, status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT });

      const response = await controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      expect(response).toStrictEqual({ folderName, status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT });
      expect(serviceCreateFacilityFolder).toHaveBeenCalledTimes(0);
    });

    it('throws BadRequestException if we are still sending job to Custodian, someone is calling API too frequently', async () => {
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockResolvedValueOnce(dealFolderId);
      when(sharepointServiceGetFacilityFolder)
        .calledWith({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      const message = valueGenerator.string();
      const exception = new BadRequestException(message);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(dealFolderId, folderName, res).mockRejectedValueOnce(exception);

      const response = controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      await expect(response).rejects.toBeInstanceOf(BadRequestException);
      await expect(response).rejects.toThrow(message);
      await expect(response).rejects.toBe(exception);
      expect(serviceCreateFacilityFolder).toHaveBeenCalledTimes(0);
    });

    it('throws CustodianException if getting job from Custodian fails', async () => {
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockResolvedValueOnce(dealFolderId);
      when(sharepointServiceGetFacilityFolder)
        .calledWith({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      const message = valueGenerator.string();
      const exception = new CustodianException(message);
      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(dealFolderId, folderName, res).mockRejectedValueOnce(exception);

      const response = controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      await expect(response).rejects.toBeInstanceOf(CustodianException);
      await expect(response).rejects.toThrow(message);
      await expect(response).rejects.toBe(exception);
      expect(serviceCreateFacilityFolder).toHaveBeenCalledTimes(0);
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
      when(serviceGetDealFolderName).calledWith(buyerName, dealIdentifier).mockReturnValueOnce(dealFolderName);
      when(serviceGetFacilityFolderName).calledWith(facilityIdentifier).mockReturnValueOnce(folderName);
      when(serviceGetDealFolderId).calledWith(siteId, dealFolderName).mockResolvedValueOnce(dealFolderId);
      when(sharepointServiceGetFacilityFolder)
        .calledWith({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })
        .mockResolvedValueOnce(emptySharepointResponse);

      when(custodianServiceGetApiResponseIfFolderInCustodian).calledWith(dealFolderId, folderName, res).mockResolvedValueOnce({ folderName, status });

      const response = await controller.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto, res);

      expect(response).toStrictEqual({ folderName, status });
      expect(serviceCreateFacilityFolder).toHaveBeenCalledTimes(0);
    });
  });
});
