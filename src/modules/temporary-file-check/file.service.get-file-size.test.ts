import { FileGetPropertiesResponse } from '@azure/storage-file-share';
import { BadRequestException } from '@nestjs/common';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { when } from 'jest-when';

import { DtfsStorageFileService } from '../dtfs-storage/dtfs-storage-file.service';
import { FileService } from './file.service';

describe('FileService', () => {
  const valueGenerator = new RandomValueGenerator();
  const fileName = valueGenerator.string();
  const fileLocationPath = valueGenerator.string();
  const expectedFileSize = valueGenerator.integer({ min: 1, max: MAX_FILE_SIZE });

  let mockDtfsStorageFileService: DtfsStorageFileService;
  let mockDtfsStorageFileServiceGetFileProperties: jest.Mock;
  let service: FileService;

  beforeEach(() => {
    mockDtfsStorageFileService = {} as DtfsStorageFileService;
    mockDtfsStorageFileServiceGetFileProperties = jest.fn();
    mockDtfsStorageFileService.getFileProperties = mockDtfsStorageFileServiceGetFileProperties;
    service = new FileService(mockDtfsStorageFileService);
  });

  describe('getFileSize', () => {
    it('returns the file size', async () => {
      when(mockDtfsStorageFileServiceGetFileProperties)
        .calledWith(fileName, fileLocationPath)
        .mockResolvedValueOnce({ contentLength: expectedFileSize } as FileGetPropertiesResponse);

      const { fileSize } = await service.getFileSize({ fileName, fileLocationPath });

      expect(fileSize).toStrictEqual(expectedFileSize);
    });

    it('throws a BadRequestException if the file size exceeds the maximum allowed', async () => {
      when(mockDtfsStorageFileServiceGetFileProperties)
        .calledWith(fileName, fileLocationPath)
        .mockResolvedValueOnce({ contentLength: MAX_FILE_SIZE + 1 } as FileGetPropertiesResponse);

      const getFileSizePromise = service.getFileSize({ fileName, fileLocationPath });

      await expect(getFileSizePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(getFileSizePromise).rejects.toThrow('Bad request');
      await expect(getFileSizePromise).rejects.toHaveProperty('response.error', 'The file exceeds the maximum allowed size.');
    });
  });
});
