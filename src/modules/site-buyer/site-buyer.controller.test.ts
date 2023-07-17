import { CreateBuyerFolderGenerator } from '@ukef-test/support/generator/create-buyer-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { BuyerFolderCreationService } from './buyer-folder-creation.service';
import { SiteExporterInvalidException } from './exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from './exception/site-exporter-not-found.exception';
import { SiteBuyerController } from './site-buyer.controller';

describe('SiteBuyerController', () => {
  const valueGenerator = new RandomValueGenerator();

  const { siteId, createBuyerFolderRequestItem, createBuyerFolderRequest } = new CreateBuyerFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

  describe('createBuyerFolder', () => {
    const buyerName = valueGenerator.string();

    let serviceCreateBuyerFolder: jest.Mock;
    let controller: SiteBuyerController;

    beforeEach(() => {
      serviceCreateBuyerFolder = jest.fn();
      const buyerFolderService = new BuyerFolderCreationService(null, null, null, null);
      buyerFolderService.createBuyerFolder = serviceCreateBuyerFolder;

      controller = new SiteBuyerController(buyerFolderService);
    });

    it('returns the buyer name of the folder that was created', async () => {
      when(serviceCreateBuyerFolder).calledWith(siteId, createBuyerFolderRequestItem).mockResolvedValueOnce(buyerName);

      const response = await controller.createBuyerFolder({ siteId }, createBuyerFolderRequest);

      expect(response).toStrictEqual({ buyerName: buyerName });
    });

    it('throws the original error if creating the buyer folder throws a SiteExporterNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyNotFound = new SiteExporterNotFoundException(errorMessage);
      when(serviceCreateBuyerFolder).calledWith(siteId, createBuyerFolderRequestItem).mockRejectedValueOnce(folderDependencyNotFound);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(SiteExporterNotFoundException);
      await expect(createBuyerFolderPromise).rejects.toThrow(errorMessage);
      await expect(createBuyerFolderPromise).rejects.toBe(folderDependencyNotFound);
    });

    it('throws the original error if creating the buyer folder throws an a SiteExporterInvalidException', async () => {
      const errorMessage = valueGenerator.string();
      const folderDependencyInvalidException = new SiteExporterInvalidException(errorMessage);
      when(serviceCreateBuyerFolder).calledWith(siteId, createBuyerFolderRequestItem).mockRejectedValueOnce(folderDependencyInvalidException);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(SiteExporterInvalidException);
      await expect(createBuyerFolderPromise).rejects.toThrow(errorMessage);
      await expect(createBuyerFolderPromise).rejects.toBe(folderDependencyInvalidException);
    });

    it('throws the original error if creating the buyer folder throws an exception that is not a SiteExporterNotFoundException', async () => {
      const errorMessage = valueGenerator.string();
      const error = new Error(errorMessage);
      when(serviceCreateBuyerFolder).calledWith(siteId, createBuyerFolderRequestItem).mockRejectedValueOnce(error);

      const createBuyerFolderPromise = controller.createBuyerFolder({ siteId }, createBuyerFolderRequest);

      await expect(createBuyerFolderPromise).rejects.toBeInstanceOf(Error);
      await expect(createBuyerFolderPromise).rejects.toThrow(errorMessage);
      await expect(createBuyerFolderPromise).rejects.toBe(error);
    });
  });
});
