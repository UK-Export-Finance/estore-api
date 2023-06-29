import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { SiteDealController } from './site-deal.controller';
import { SiteDealService } from './site-deal.service';

describe('SiteDealController', () => {
  const valueGenerator = new RandomValueGenerator();
  const siteDealService = new SiteDealService(null, null, null, null);

  let siteDealController: SiteDealController;

  const siteDealServiceCreateFacilityFolder = jest.fn();
  siteDealService.createFacilityFolder = siteDealServiceCreateFacilityFolder;

  beforeEach(() => {
    siteDealServiceCreateFacilityFolder.mockReset();
    siteDealController = new SiteDealController(siteDealService);
  });

  describe('createFacilityFolder', () => {
    const { createFacilityFolderParamsDto, createFacilityFolderRequestItem, createFacilityFolderRequestDto, createFacilityFolderResponseDto } =
      new CreateFacilityFolderGenerator(valueGenerator).generate({ numberToGenerate: 1 });

    it('returns the expected response with created folder name', async () => {
      when(siteDealServiceCreateFacilityFolder)
        .calledWith(createFacilityFolderParamsDto.siteId, createFacilityFolderParamsDto.dealId, createFacilityFolderRequestItem)
        .mockResolvedValueOnce(createFacilityFolderResponseDto);

      const result = await siteDealController.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto);

      expect(result).toEqual(createFacilityFolderResponseDto);
    });

    it('throws an error if site deal service throws an error', async () => {
      const error = new Error(`Error message`);
      when(siteDealServiceCreateFacilityFolder)
        .calledWith(createFacilityFolderParamsDto.siteId, createFacilityFolderParamsDto.dealId, createFacilityFolderRequestItem)
        .mockRejectedValueOnce(error);

      const responsePromise = siteDealController.createFacilityFolder(createFacilityFolderParamsDto, createFacilityFolderRequestDto);

      await expect(responsePromise).rejects.toThrow(error);
    });
  });
});
