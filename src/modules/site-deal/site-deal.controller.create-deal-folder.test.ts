import { BadRequestException } from '@nestjs/common';
import { CreateDealFolderGenerator } from '@ukef-test/support/generator/create-deal-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealFolderService } from './deal-folder.service';
import { FolderDependencyInvalidException } from './exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';
import { SiteDealController } from './site-deal.controller';
import { SiteDealService } from './site-deal.service';

describe('SiteDealController', () => {
  const valueGenerator = new RandomValueGenerator();

  const {
    siteId,
    createDealFolderRequestItem: { dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket },
    createDealFolderRequest,
  } = new CreateDealFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  describe('createDealFolder', () => {
    const createdFolderName = valueGenerator.string();

    let serviceCreateDealFolder: jest.Mock;
    let controller: SiteDealController;

    beforeEach(() => {
      serviceCreateDealFolder = jest.fn();
      const dealFolderService = new DealFolderService(null, null, null, null);
      dealFolderService.createDealFolder = serviceCreateDealFolder;

      controller = new SiteDealController(new SiteDealService(null, null, null, null), dealFolderService);
    });

    it('returns the name of the deal folder that was created', async () => {
      when(serviceCreateDealFolder)
        .calledWith({ siteId, dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket })
        .mockResolvedValueOnce(createdFolderName);

      const response = await controller.createDealFolder({ siteId }, createDealFolderRequest);

      expect(response).toStrictEqual({ folderName: createdFolderName });
    });

    it('throws a BadRequestException that exposes the error message if creating the deal folder throws a FolderDependencyNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyNotFound = new FolderDependencyNotFoundException(errorMessage);
      when(serviceCreateDealFolder)
        .calledWith({ siteId, dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket })
        .mockRejectedValueOnce(folderDependencyNotFound);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toHaveProperty('cause', folderDependencyNotFound);
    });

    it('throws the original error if creating the deal folder throws an a FolderDependencyInvalidException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyInvalidException = new FolderDependencyInvalidException(errorMessage);
      when(serviceCreateDealFolder)
        .calledWith({ siteId, dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket })
        .mockRejectedValueOnce(folderDependencyInvalidException);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(FolderDependencyInvalidException);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(folderDependencyInvalidException);
    });

    it('throws the original error if creating the deal folder throws an exception that is not a FolderDependencyNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const error = new Error(errorMessage);
      when(serviceCreateDealFolder).calledWith({ siteId, dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket }).mockRejectedValueOnce(error);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(Error);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(error);
    });
  });
});
