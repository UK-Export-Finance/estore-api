import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { DtfsStorageFileService } from '@ukef/modules/dtfs-storage/dtfs-storage-file.service';

import { GetFileSizeRequestItem } from './dto/get-file-size-request.dto';
import { GetFileSizeResponse } from './dto/get-file-size-response.dto';

@Injectable()
export class FileService {
  constructor(private readonly dtfsStorageFileService: DtfsStorageFileService) {}

  async getFileSize(fileToCheck: GetFileSizeRequestItem): Promise<GetFileSizeResponse> {
    const { fileName, fileLocationPath } = fileToCheck;
    const fileSize = await this.dtfsStorageFileService.getFileProperties(fileName, fileLocationPath).then((response) => {
      return response.contentLength as number;
    });
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException('Bad request', 'The file exceeds the maximum allowed size.');
    }

    return {
      fileSize,
    };
  }
}
