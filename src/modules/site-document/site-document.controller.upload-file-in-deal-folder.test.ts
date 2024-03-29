import { DtfsStorageAuthenticationFailedException } from '@ukef/modules/dtfs-storage/exception/dtfs-storage-authentication-failed.exception';
import { DtfsStorageFileNotFoundException } from '@ukef/modules/dtfs-storage/exception/dtfs-storage-file-not-found.exception';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { UploadFileInDealFolderGenerator } from '@ukef-test/support/generator/upload-file-in-deal-folder-generator';
import { when } from 'jest-when';

import { UploadFileInDealFolderExistsException } from './exception/upload-file-in-deal-folder-exists.exception';
import { UploadFileInDealFolderSiteNotFoundException } from './exception/upload-file-in-deal-folder-site-not-found.exception';
import { SiteDocumentController } from './site-document.controller';
import { SiteDocumentService } from './site-document.service';

describe('SiteDocumentController', () => {
  const valueGenerator = new RandomValueGenerator();

  const { uploadFileInDealFolderRequest, uploadFileInDealFolderResponse, uploadFileInDealFolderParams } = new UploadFileInDealFolderGenerator(
    valueGenerator,
  ).generate({ numberToGenerate: 1 });

  const [{ fileName, fileLocationPath, buyerName, documentType }] = uploadFileInDealFolderRequest;
  const { siteId: ukefSiteId, dealId } = uploadFileInDealFolderParams;

  const siteDocumentService = new SiteDocumentService(null, null, null, null);

  const serviceUploadFileInDealFolder = jest.fn();
  siteDocumentService.uploadFileInDealFolder = serviceUploadFileInDealFolder;

  let controller: SiteDocumentController;

  beforeEach(() => {
    serviceUploadFileInDealFolder.mockReset();
    controller = new SiteDocumentController(siteDocumentService);
  });

  describe('uploadFileInDealFolder', () => {
    it('returns the path to the file that was uploaded', async () => {
      when(serviceUploadFileInDealFolder)
        .calledWith(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType)
        .mockResolvedValueOnce(uploadFileInDealFolderResponse);

      const response = await controller.uploadFileInDealFolder(uploadFileInDealFolderParams, uploadFileInDealFolderRequest);

      expect(response).toStrictEqual(uploadFileInDealFolderResponse);
    });

    it.each([
      {
        Exception: UploadFileInDealFolderSiteNotFoundException,
      },
      {
        Exception: UploadFileInDealFolderExistsException,
      },
      {
        Exception: DtfsStorageFileNotFoundException,
      },
      {
        Exception: DtfsStorageAuthenticationFailedException,
      },
    ])('throws the original error if uploading the file throws an $Exception.name', async ({ Exception }) => {
      const errorMessage = valueGenerator.string();
      const fileExists = new Exception(errorMessage);

      when(serviceUploadFileInDealFolder).calledWith(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType).mockRejectedValueOnce(fileExists);

      const uploadFilePromise = controller.uploadFileInDealFolder(uploadFileInDealFolderParams, uploadFileInDealFolderRequest);

      await expect(uploadFilePromise).rejects.toBeInstanceOf(Exception);
      await expect(uploadFilePromise).rejects.toThrow(errorMessage);
      await expect(uploadFilePromise).rejects.toBe(fileExists);
    });
  });
});
