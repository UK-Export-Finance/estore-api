import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import GraphConfig from '@ukef/config/graph.config';

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

  getClient(): Client {
    return this.client;
  }
}

export default GraphClientService;
