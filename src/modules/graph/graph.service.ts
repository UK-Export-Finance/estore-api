import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';

import { createGraphError as createWrapGraphError } from './createGraphError';

@Injectable()
export class GraphService {
  private readonly client: Client;

  constructor(graphClientService: GraphClientService) {
    this.client = graphClientService.client;
  }

  async get<T>({ path, filter, expand }: GraphGetParams): Promise<T> {
    const request = this.createGetRequest({ path, filter, expand });
    const response = await this.makeGetRequest({ request });
    return response;
  }

  async post<T>({ path, listItem }: GraphPostParams): Promise<T> {
    const request = this.client.api(path);
    const response = await this.makePostRequest({ request }, listItem);
    return response;
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
      createWrapGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: [],
      });
    }
  }

  private makePostRequest({ request }: { request: GraphRequest }, listItem: any) {
    try {
      return request.post(listItem);
    } catch (error) {
      createWrapGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: [],
      });
    }
  }
}

export interface GraphGetParams {
  path: string;
  filter?: string;
  expand?: string;
}

export interface GraphPostParams {
  path: string;
  listItem: object;
}

export default GraphService;
