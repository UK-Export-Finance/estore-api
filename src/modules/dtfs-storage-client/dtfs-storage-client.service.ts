import {
  AccountSASPermissions,
  AccountSASResourceTypes,
  AccountSASServices,
  generateAccountSASQueryParameters,
  SASProtocol,
  ShareFileClient,
  StorageSharedKeyCredential,
} from '@azure/storage-file-share';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import DtfsConfig from '@ukef/config/dtfs-storage.config';

@Injectable()
export class DtfsStorageClientService {
  readonly baseUrl: string;
  readonly dealDocumentsFolderPath: string;
  readonly storageSharedKeyCredential: StorageSharedKeyCredential;
  readonly sasTokenTtlInSeconds: number;

  constructor(
    @Inject(DtfsConfig.KEY)
    { baseUrl, accountName, accountKey, dealDocumentsFolderPath, sasTokenTtlInSeconds }: ConfigType<typeof DtfsConfig>,
  ) {
    this.baseUrl = baseUrl;
    this.dealDocumentsFolderPath = dealDocumentsFolderPath;
    this.storageSharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    this.sasTokenTtlInSeconds = sasTokenTtlInSeconds;
  }

  public getShareFileClient(fileName: string, fileLocationPath: string): ShareFileClient {
    const url = `${this.baseUrl}/${this.dealDocumentsFolderPath}/${fileLocationPath}/${fileName}`;
    const accountSas = this.createAccountSas(this.sasTokenTtlInSeconds);
    return new ShareFileClient(`${url}?${accountSas}`);
  }

  private createAccountSas(sasTokenTtlInSeconds: number) {
    const sasOptions = {
      services: AccountSASServices.parse('f').toString(), // just files, other services are removed
      resourceTypes: AccountSASResourceTypes.parse('o').toString(), // object resource is enough
      permissions: AccountSASPermissions.parse('r'), // read permission is enough to download files.
      protocol: SASProtocol.Https,
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + sasTokenTtlInSeconds * 1000),
    };

    const sasToken = generateAccountSASQueryParameters(sasOptions, this.storageSharedKeyCredential).toString();

    return sasToken[0] === '?' ? sasToken : `?${sasToken}`;
  }
}

export default DtfsStorageClientService;
