import {
  Client,
  GraphRequest,
  LargeFileUploadSession,
  LargeFileUploadTask,
  LargeFileUploadTaskOptions,
  StreamUpload,
  UploadResult,
} from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';
import { Readable } from 'stream';

import { createGraphError } from './create-graph-error';
import { KnownError, postFacilityTermExistsKnownError } from './known-errors';

@Injectable()
export class GraphService {
  private readonly client: Client;

  constructor(graphClientService: GraphClientService) {
    this.client = graphClientService.client;
  }

  async get<T>({ path, filter, expand, knownErrors }: GraphGetParams): Promise<T> {
    const request = this.createGetRequest({ path, filter, expand });
    return await this.makeGetRequest({ request, knownErrors });
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

  private async makeGetRequest({ request, knownErrors }: { request: GraphRequest; knownErrors?: KnownError[] }) {
    try {
      return await request.get();
    } catch (error) {
      createGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: knownErrors ?? [],
      });
    }
  }

  post<T>({ path, requestBody }: GraphPostParams): Promise<T> {
    const request = this.createPostRequest({ path });
    return this.makePostRequest({ request, requestBody });
  }

  private createPostRequest({ path }): GraphRequest {
    const request = this.client.api(path);

    return request;
  }

  private async makePostRequest({ request, requestBody }: { request: GraphRequest; requestBody: any }) {
    try {
      return await request.post(requestBody);
    } catch (error) {
      createWrapGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: [postFacilityTermExistsKnownError()],
      });
    }
  }

  async uploadFile(url: string, file: NodeJS.ReadableStream, fileName: string, fileSize: number): Promise<UploadResult> {
    const uploadSession: LargeFileUploadSession = await LargeFileUploadTask.createUploadSession(this.client, `https://graph.microsoft.com/v1.0/${url}`, {});
    const fileToUpload = new Readable().wrap(file);
    const options: LargeFileUploadTaskOptions = {
      rangeSize: fileSize,
    };
    const task = new LargeFileUploadTask(this.client, new StreamUpload(fileToUpload, fileName, fileSize), uploadSession, options);
    const uploadResult = await task.upload();
    return uploadResult;
  }
}

export interface GraphGetParams {
  path: string;
  filter?: string;
  expand?: string;
  knownErrors?: KnownError[];
}

export interface GraphPostParams {
  path: string;
  requestBody: any;
}

export default GraphService;
