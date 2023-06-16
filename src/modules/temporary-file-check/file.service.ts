import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { DtfsFileService } from '@ukef/modules/dtfs/dtfs-file.service';
import { DtfsAuthenticationService } from '@ukef/modules/dtfs-authentication/dtfs-authentication.service';

import { ReturnFileSizeIfExistsAndNotTooLargeRequestItem } from './dto/return-file-size-if-exists-and-not-too-large-request.dto';
import { ReturnFileSizeIfExistsAndNotTooLargeResponse } from './dto/return-file-size-if-exists-and-not-too-large-response.dto';

@Injectable()
export class FileService {
  constructor(private readonly dtfsAuthenticationService: DtfsAuthenticationService, private readonly dtfsFileService: DtfsFileService) {}

  async returnFileSizeIfExistsAndNotTooLargeResponse(
    fileToCheck: ReturnFileSizeIfExistsAndNotTooLargeRequestItem,
  ): Promise<ReturnFileSizeIfExistsAndNotTooLargeResponse> {
    const { fileName, fileLocationPath } = fileToCheck;
    const idToken = await this.getIdToken();
    const fileSize = await this.dtfsFileService.getFileSize(fileName, fileLocationPath, idToken);
    if (fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException('Bad request', 'The file exceeds the maximum allowed size.');
    }

    return {
      fileSize,
    };
  }

  private getIdToken(): Promise<string> {
    return this.dtfsAuthenticationService.getIdToken();
  }
}
