import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DealFolderCreationService } from './deal-folder-creation.service';
import { FacilityFolderCreationService } from './facility-folder-creation.service';
import { SiteDealController } from './site-deal.controller';

describe('SiteDealController', () => {
  const valueGenerator = new RandomValueGenerator();
  const siteDealService = new FacilityFolderCreationService(null, null, null, null);

  let siteDealController: SiteDealController;

  const serviceCreateFacilityFolder = jest.fn();
  siteDealService.createFacilityFolder = serviceCreateFacilityFolder;

  beforeEach(() => {
    serviceCreateFacilityFolder.mockReset();
    siteDealController = new SiteDealController(siteDealService, new DealFolderCreationService(null, null, null, null));
  });

  describe('createFacilityFolder', () => {
    const { createFacilityFolderParamsDto, createFacilityFolderRequestItem, createFacilityFolderRequestDto, createFacilityFolderResponseDto } =
      new CreateFacilityFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

    it('returns the expected response with created folder name', async () => {
      when(serviceCreateFacilityFolder)
        .calledWith(createFacilityFolderParamsDto.siteId, createFacilityFolderParamsDto.dealId, createFacilityFolderRequestItem)
        .mockResolvedValueOnce(createFacilityFolderResponseDto);

      const result = await siteDealController.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto);

      expect(result).toEqual(createFacilityFolderResponseDto);
    });

    it('throws an error if site deal service throws an error', async () => {
      const error = new Error(`Error message`);
      when(serviceCreateFacilityFolder)
        .calledWith(createFacilityFolderParamsDto.siteId, createFacilityFolderParamsDto.dealId, createFacilityFolderRequestItem)
        .mockRejectedValueOnce(error);

      const responsePromise = siteDealController.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto);

      await expect(responsePromise).rejects.toThrow(error);
    });
  });
});
