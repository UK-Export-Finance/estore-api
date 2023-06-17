import { Client, GraphRequest } from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';

import GraphClientService from '../graph-client/graph-client.service';
import { commonGraphExceptionHandling } from './common/common-graph-exception-handling';

@Injectable()
export class GraphService {
  private readonly client: Client;

  constructor(graphClientService: GraphClientService) {
    this.client = graphClientService.getClient();
  }

  get<T>({ path, filter, expand }: GraphGetParams): Promise<T> {
    const request = this.createGetRequest({ path, filter, expand });
    return this.makeGetRequest({ request });
  }

  post<T>({ path, listItem }: GraphPostParams): Promise<T> {
    const request = this.client.api(path);
    return this.makePostRequest({ request }, listItem);
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

  private makeGetRequest({ request }: { request: GraphRequest }) {
    try {
      return request.get();
    } catch (error) {
      commonGraphExceptionHandling(error);
    }
  }

  private makePostRequest({ request }: { request: GraphRequest }, listItem: any) {
    try {
      return request.post(listItem);
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

export interface GraphPostParams {
  path: string;
  listItem: object;
}

export default GraphService;
