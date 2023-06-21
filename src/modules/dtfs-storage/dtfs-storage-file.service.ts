import { FileGetPropertiesResponse, ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs-storage.config';

import { DtfsStorageException } from './exception/dtfs-storage.exception';
import { DtfsStorageFileNotFoundException } from './exception/dtfs-storage-file-not-found.exception';

@Injectable()
export class DtfsStorageFileService {
  private readonly baseUrl: string;
  private readonly storageSharedKeyCredential: StorageSharedKeyCredential;

  constructor(
    @Inject(DtfsConfig.KEY)
    { baseUrl, accountName, accountKey }: ConfigType<typeof DtfsConfig>,
  ) {
    this.baseUrl = baseUrl;
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  }

  async getFileProperties(fileName: string, fileLocationPath: string): Promise<FileGetPropertiesResponse> {
    const url = `${this.baseUrl}/${fileLocationPath}/${fileName}`;
    const options = { fileRequestIntent: 'backup' };
    const shareFileClient = new ShareFileClient(url, this.storageSharedKeyCredential, options);

    return await shareFileClient.getProperties().catch((error) => {
      if (error.statusCode === 404) {
        throw new DtfsStorageFileNotFoundException(`File ${fileLocationPath}/${fileName} was not found in DTFS.`, error);
      }
      throw new DtfsStorageException(`Failed to get properties for file ${fileLocationPath}/${fileName}.`, error);
    });
  }
}
