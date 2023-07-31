import { FileGetPropertiesResponse, RestError } from '@azure/storage-file-share';
import { Injectable } from '@nestjs/common';
import DtfsStorageClientService from '@ukef/modules/dtfs-storage-client/dtfs-storage-client.service';

import { DtfsStorageException } from './exception/dtfs-storage.exception';
import { DtfsStorageAuthenticationFailedException } from './exception/dtfs-storage-authentication-failed.exception';
import { DtfsStorageFileNotFoundException } from './exception/dtfs-storage-file-not-found.exception';

@Injectable()
export class DtfsStorageFileService {
  constructor(private readonly dtfsStorageClientService: DtfsStorageClientService) {}

  getFileProperties(fileName: string, fileLocationPath: string): Promise<FileGetPropertiesResponse> {
    const shareFileClient = this.dtfsStorageClientService.getShareFileClient(fileName, fileLocationPath);

    return shareFileClient.getProperties().catch((error) => this.handleGetFileError(error, fileName, fileLocationPath, true));
  }

  getFile(fileName: string, fileLocationPath: string): Promise<NodeJS.ReadableStream> {
    const shareFileClient = this.dtfsStorageClientService.getShareFileClient(fileName, fileLocationPath);

    return shareFileClient
      .download()
      .then((response) => response.readableStreamBody)
      .catch((error) => this.handleGetFileError(error, fileName, fileLocationPath));
  }

  private handleGetFileError(error: RestError, fileName: string, fileLocationPath: string, isGetFilePropertiesRequest?: boolean): never {
    if (error.statusCode === 403) {
      throw new DtfsStorageAuthenticationFailedException('Failed to authenticate with the DTFS storage account.', error);
    }
    if (error.statusCode === 404) {
      throw new DtfsStorageFileNotFoundException(`File ${fileLocationPath}/${fileName} was not found in DTFS.`, error);
    }
    throw new DtfsStorageException(`Failed to get ${isGetFilePropertiesRequest ? 'properties for ' : ''}file ${fileLocationPath}/${fileName}.`, error);
  }
}
