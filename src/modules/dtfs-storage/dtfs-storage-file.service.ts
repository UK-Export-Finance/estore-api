import { FileGetPropertiesResponse, RestError, RestError, ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs-storage.config';

import DtfsStorageClientService from '../dtfs-storage-client/dtfs-storage-client.service';
import { DtfsStorageException } from './exception/dtfs-storage.exception';
import { DtfsStorageFileNotFoundException } from './exception/dtfs-storage-file-not-found.exception';

@Injectable()
export class DtfsStorageFileService {
  private readonly dtfsStorageClientService: DtfsStorageClientService;

  constructor(dtfsStorageClientService: DtfsStorageClientService) {
    this.dtfsStorageClientService = dtfsStorageClientService;
  }

  getFileProperties(fileName: string, fileLocationPath: string): Promise<FileGetPropertiesResponse> {
    const shareFileClient = this.dtfsStorageClientService.getShareFileClient(fileName, fileLocationPath);

    return shareFileClient.getProperties().catch((error) => this.handleGetFilePropertiesError(error, fileName, fileLocationPath));
  }

  private getShareFileClient(fileName: string, fileLocationPath: string): ShareFileClient {
    const url = `${this.baseUrl}/${fileLocationPath}/${fileName}`;
    return new ShareFileClient(url, this.storageSharedKeyCredential);
  }

  private handleGetFilePropertiesError(error: RestError, fileName: string, fileLocationPath: string): never {
    if (error.statusCode === 404) {
      throw new DtfsStorageFileNotFoundException(`File ${fileLocationPath}/${fileName} was not found in DTFS.`, error);
    }
    throw new DtfsStorageException(`Failed to get properties for file ${fileLocationPath}/${fileName}.`, error);
  }
}
