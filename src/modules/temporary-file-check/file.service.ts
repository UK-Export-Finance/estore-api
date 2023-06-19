import { BadRequestException, Injectable } from '@nestjs/common';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { DtfsFileService } from '@ukef/modules/dtfs/dtfs-file.service';

import { DtfsAuthenticationService } from '../dtfs-authentication/dtfs-authentication.service';
import { GetFileSizeIfExistsAndNotTooLargeRequestItem } from './dto/get-file-size-if-exists-and-not-too-large-request.dto';
import { GetFileSizeIfExistsAndNotTooLargeResponse } from './dto/get-file-size-if-exists-and-not-too-large-response.dto';

@Injectable()
export class FileService {
  constructor(private readonly dtfsAuthenticationService: DtfsAuthenticationService, private readonly dtfsFileService: DtfsFileService) {}

  async getFileSizeIfExistsAndNotTooLarge(fileToCheck: GetFileSizeIfExistsAndNotTooLargeRequestItem): Promise<GetFileSizeIfExistsAndNotTooLargeResponse> {
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
