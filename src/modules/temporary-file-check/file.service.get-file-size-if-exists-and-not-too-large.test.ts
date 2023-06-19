import { BadRequestException } from '@nestjs/common';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { getMockDtfsAuthenticationService } from '@ukef-test/support/dtfs-authentication.service.mock';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DtfsFileService } from '../dtfs/dtfs-file.service';
import { DtfsAuthenticationService } from '../dtfs-authentication/dtfs-authentication.service';
import { FileService } from './file.service';

describe('FacilityCovenantService', () => {
  const valueGenerator = new RandomValueGenerator();
  const idToken = valueGenerator.string();
  const fileName = valueGenerator.string();
  const fileLocationPath = valueGenerator.string();
  const expectedFileSize = valueGenerator.integer({ min: 1, max: MAX_FILE_SIZE });

  let dtfsAuthenticationService: DtfsAuthenticationService;
  let service: FileService;

  let dtfsFileServiceGetFileSize: jest.Mock;

  beforeEach(() => {
    const mockDtfsAuthenticationService = getMockDtfsAuthenticationService();
    dtfsAuthenticationService = mockDtfsAuthenticationService.service;
    const dtfsAuthenticationServiceGetIdToken = mockDtfsAuthenticationService.getIdToken;
    when(dtfsAuthenticationServiceGetIdToken).calledWith().mockResolvedValueOnce(idToken);

    const dtfsFileService = new DtfsFileService(null, null);
    dtfsFileServiceGetFileSize = jest.fn();
    dtfsFileService.getFileSize = dtfsFileServiceGetFileSize;

    service = new FileService(dtfsAuthenticationService, dtfsFileService);
  });

  describe('getFileSizeIfExistsAndNotTooLarge', () => {
    it('returns the file size', async () => {
      when(dtfsFileServiceGetFileSize).calledWith(fileName, fileLocationPath, idToken).mockResolvedValueOnce(expectedFileSize);

      const { fileSize } = await service.getFileSizeIfExistsAndNotTooLarge({ fileName, fileLocationPath });

      expect(fileSize).toStrictEqual(expectedFileSize);
    });

    it('throws a BadRequestException if the file size exceeds the maximum allowed', async () => {
      when(dtfsFileServiceGetFileSize)
        .calledWith(fileName, fileLocationPath, idToken)
        .mockResolvedValueOnce(MAX_FILE_SIZE + 1);

      const getFileSizeIfExistsAndNotTooLargePromise = service.getFileSizeIfExistsAndNotTooLarge({ fileName, fileLocationPath });

      await expect(getFileSizeIfExistsAndNotTooLargePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(getFileSizeIfExistsAndNotTooLargePromise).rejects.toThrow('Bad request');
      await expect(getFileSizeIfExistsAndNotTooLargePromise).rejects.toHaveProperty('response.error', 'The file exceeds the maximum allowed size.');
    });
  });
});
