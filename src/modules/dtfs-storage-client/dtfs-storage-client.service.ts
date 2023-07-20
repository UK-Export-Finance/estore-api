import { ShareFileClient, StorageSharedKeyCredential } from '@azure/storage-file-share';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs-storage.config';

@Injectable()
export class DtfsStorageClientService {
  readonly baseUrl: string;
  readonly dealDocumentsFolderPath: string;
  readonly storageSharedKeyCredential: StorageSharedKeyCredential;

  constructor(
    @Inject(DtfsConfig.KEY)
    { baseUrl, accountName, accountKey, dealDocumentsFolderPath }: ConfigType<typeof DtfsConfig>,
  ) {
    this.baseUrl = baseUrl;
    this.dealDocumentsFolderPath = dealDocumentsFolderPath;
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
  }

  public getShareFileClient(fileName: string, fileLocationPath: string): ShareFileClient {
    const url = `${this.baseUrl}/${this.dealDocumentsFolderPath}/${fileLocationPath}/${fileName}`;
    return new ShareFileClient(url, this.storageSharedKeyCredential);
  }
}

export default DtfsStorageClientService;
