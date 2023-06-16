import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';

import GraphClientService from '../graph-client/graph-client.service';
import { commonGraphExceptionHandling } from './common/common-graph-exception-handling';

@Injectable()
export class GraphService {
  private readonly client: Client;

  constructor(graphClientService: GraphClientService) {
    this.client = graphClientService.client;
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
    } catch (error) {
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
