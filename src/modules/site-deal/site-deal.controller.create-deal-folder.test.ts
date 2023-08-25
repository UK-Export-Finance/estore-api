import { CreateDealFolderGenerator } from '@ukef-test/support/generator/create-deal-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

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
    const createdFolderName = valueGenerator.string();

    let serviceCreateDealFolder: jest.Mock;
    let controller: SiteDealController;

    beforeEach(() => {
      serviceCreateDealFolder = jest.fn();
      const dealFolderService = new DealFolderCreationService(null, null, null, null);
      dealFolderService.createDealFolder = serviceCreateDealFolder;

      controller = new SiteDealController(new FacilityFolderCreationService(null, null, null, null), dealFolderService);
    });

    it('returns the name of the deal folder that was created', async () => {
      when(serviceCreateDealFolder).calledWith({ siteId, dealIdentifier, buyerName, destinationMarket, riskMarket }).mockResolvedValueOnce(createdFolderName);

      const response = await controller.createDealFolder({ siteId }, createDealFolderRequest);

      expect(response).toStrictEqual({ folderName: createdFolderName });
    });

    it('throws the original error if creating the deal folder throws a FolderDependencyNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyNotFound = new FolderDependencyNotFoundException(errorMessage);
      when(serviceCreateDealFolder)
        .calledWith({ siteId, dealIdentifier, buyerName, destinationMarket, riskMarket })
        .mockRejectedValueOnce(folderDependencyNotFound);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(FolderDependencyNotFoundException);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(folderDependencyNotFound);
    });

    it('throws the original error if creating the deal folder throws a FolderDependencyInvalidException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyInvalidException = new FolderDependencyInvalidException(errorMessage);
      when(serviceCreateDealFolder)
        .calledWith({ siteId, dealIdentifier, buyerName, destinationMarket, riskMarket })
        .mockRejectedValueOnce(folderDependencyInvalidException);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(FolderDependencyInvalidException);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(folderDependencyInvalidException);
    });

    it('throws the original error if creating the deal folder throws an exception that is not a FolderDependencyNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const error = new Error(errorMessage);
      when(serviceCreateDealFolder).calledWith({ siteId, dealIdentifier, buyerName, destinationMarket, riskMarket }).mockRejectedValueOnce(error);

      const createDealFolderPromise = controller.createDealFolder({ siteId }, createDealFolderRequest);

      await expect(createDealFolderPromise).rejects.toBeInstanceOf(Error);
      await expect(createDealFolderPromise).rejects.toThrow(errorMessage);
      await expect(createDealFolderPromise).rejects.toBe(error);
    });
  });
});
