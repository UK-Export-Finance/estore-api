import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import GraphConfig from '@ukef/config/graph.config';

type RequiredConfigKeys = 'clientId' | 'clientSecret' | 'tenantId' | 'scope';

@Injectable()
export class GraphService {
  client: Client;
  constructor(
    @Inject(GraphConfig.KEY)
    private readonly config: Pick<ConfigType<typeof GraphConfig>, RequiredConfigKeys>,
  ) {
    const credential = new ClientSecretCredential(this.config.tenantId, this.config.clientId, this.config.clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: [this.config.scope],
    });

    this.client = Client.initWithMiddleware({
      debugLogging: true,
      authProvider,
    });
  }
}
