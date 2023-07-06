import { BadRequestException, Injectable } from '@nestjs/common';
import { DTFS_MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { DtfsStorageFileService } from '@ukef/modules/dtfs-storage/dtfs-storage-file.service';

import { GetFileSizeRequestItem } from './dto/get-file-size-request.dto';
import { GetFileSizeResponse } from './dto/get-file-size-response.dto';

@Injectable()
export class FileService {
  constructor(private readonly dtfsStorageFileService: DtfsStorageFileService) {}

  async getFileSize(fileToCheck: GetFileSizeRequestItem): Promise<GetFileSizeResponse> {
    const { fileName, fileLocationPath } = fileToCheck;
    const fileSizeInBytes = await this.dtfsStorageFileService.getFileProperties(fileName, fileLocationPath).then((response) => {
      return response.contentLength;
    });
    if (fileSizeInBytes > DTFS_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Bad request', `The file exceeds the maximum allowed size of ${DTFS_MAX_FILE_SIZE_BYTES} bytes.`);
    }

    return {
      fileSize: fileSizeInBytes,
    };
  }
}
