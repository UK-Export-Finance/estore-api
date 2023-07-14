import { ClientSecretCredential } from '@azure/identity';
import { Client, LargeFileUploadSession, LargeFileUploadTask, LargeFileUploadTaskOptions, StreamUpload } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import GraphConfig from '@ukef/config/graph.config';
import { Readable } from 'stream';

@Injectable()
export class GraphClientService {
  client: Client;

  constructor(
    @Inject(GraphConfig.KEY)
    { tenantId, clientId, clientSecret, scope }: ConfigType<typeof GraphConfig>,
  ) {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: [scope],
    });

    this.client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider,
    });
  }

  public getFileUploadSession(url: string, headers?: unknown): Promise<LargeFileUploadSession> {
    return LargeFileUploadTask.createUploadSession(this.client, url, headers);
  }

  public getFileUploadTask(
    file: Readable,
    fileName: string,
    fileSizeInBytes: number,
    uploadSession: LargeFileUploadSession,
    options?: LargeFileUploadTaskOptions,
  ) {
    const streamUpload = new StreamUpload(file, fileName, fileSizeInBytes);
    return new LargeFileUploadTask(this.client, streamUpload, uploadSession, options);
  }
}

export default GraphClientService;
