import { ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs-storage.config';

@Injectable()
export class DtfsStorageClientService {
  readonly baseUrl: string;
  readonly storageSharedKeyCredential: StorageSharedKeyCredential;

  constructor(
    @Inject(DtfsConfig.KEY)
    { baseUrl, accountName, accountKey }: ConfigType<typeof DtfsConfig>,
  ) {
    this.baseUrl = baseUrl;
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  }

  public getShareFileClient(fileName: string, fileLocationPath: string): ShareFileClient {
    const url = `${this.baseUrl}/${fileLocationPath}/${fileName}`;
    const options = { fileRequestIntent: 'backup' };
    return new ShareFileClient(url, this.storageSharedKeyCredential, options);
  }
}

export default DtfsStorageClientService;
