import { ClientSecretCredential } from '@azure/identity';
import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import GraphConfig from '@ukef/config/graph.config';

import { commonGraphExceptionHandling } from './common/common-graph-exception-handling';

@Injectable()
export class GraphService {
  private readonly client: Client;

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

  async get<T>({ path, filter, expand }: GraphGetParams): Promise<T> {
    const request = this.createGetRequest({ path, filter, expand });
    return await this.makeGetRequest({ request });
  }

  private createGetRequest({ path, filter, expand }: GraphGetParams): GraphRequest {
    const request = this.client.api(path);

    if (filter) {
      request.filter(filter);
    }

    if (expand) {
      request.expand(expand);
    }

    return request;
  }

  private async makeGetRequest({ request }: { request: GraphRequest }) {
    try {
      return await request.get();
    } catch (error: unknown) {
      commonGraphExceptionHandling(error);
    }
  }
}

export interface GraphGetParams {
  path: string;
  filter?: string;
  expand?: string;
}

export default GraphService;
