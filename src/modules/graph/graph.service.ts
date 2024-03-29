import { Client, GraphRequest, LargeFileUploadSession, LargeFileUploadTaskOptions, UploadResult } from '@microsoft/microsoft-graph-client';
import { Injectable } from '@nestjs/common';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';
import { Readable } from 'stream';

import { createGraphError } from './create-graph-error';
import { KnownError, postFacilityTermExistsKnownError, uploadFileExistsKnownError, uploadFileSiteNotFoundKnownError } from './known-errors';

@Injectable()
export class GraphService {
  private readonly client: Client;

  constructor(private readonly graphClientService: GraphClientService) {
    this.client = graphClientService.client;
  }

  async get<T>({ path, filter, expand, top, knownErrors }: GraphGetParams): Promise<T> {
    const request = this.createGetRequest({ path, filter, expand, top });
    return await this.makeGetRequest({ request, knownErrors });
  }

  private createGetRequest({ path, filter, expand, top }: GraphGetParams): GraphRequest {
    const request = this.client.api(path);

    if (filter) {
      request.filter(filter);
    }

    if (expand) {
      request.expand(expand);
    }

    if (top) {
      request.top(top);
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
        knownErrors: knownErrors ?? [uploadFileSiteNotFoundKnownError()],
      });
    }
  }

  post<T>({ path, requestBody }: GraphPostParams): Promise<T> {
    const request = this.createPostRequest({ path });
    return this.makePostRequest({ request, requestBody });
  }

  private createPostRequest({ path }): GraphRequest {
    return this.client.api(path);
  }

  private async makePostRequest({ request, requestBody }: { request: GraphRequest; requestBody: any }) {
    try {
      return await request.post(requestBody);
    } catch (error) {
      createGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: [postFacilityTermExistsKnownError()],
      });
    }
  }

  async patch<RequestBody, ResponseBody>({ path, requestBody }: GraphPatchParams<RequestBody>): Promise<ResponseBody> {
    const request = this.createPatchRequest({ path });
    return await this.makePatchRequest({ request, requestBody });
  }

  private createPatchRequest({ path }: { path: string }): GraphRequest {
    return this.client.api(path);
  }

  private async makePatchRequest<RequestBody>({ request, requestBody }: { request: GraphRequest; requestBody: RequestBody }) {
    try {
      return await request.patch(requestBody);
    } catch (error) {
      createGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: [],
      });
    }
  }

  async uploadFile({
    file,
    fileSizeInBytes,
    fileName,
    urlToCreateUploadSession,
  }: {
    file: NodeJS.ReadableStream;
    fileSizeInBytes: number;
    fileName: string;
    urlToCreateUploadSession: string;
  }): Promise<UploadResult> {
    try {
      const uploadSessionHeaders = { item: { '@microsoft.graph.conflictBehavior': 'fail' } };
      const uploadSession: LargeFileUploadSession = await this.graphClientService.getFileUploadSession(urlToCreateUploadSession, uploadSessionHeaders);
      const fileAsReadable = new Readable().wrap(file);
      const uploadTaskOptions: LargeFileUploadTaskOptions = { rangeSize: fileSizeInBytes };
      const uploadTask = this.graphClientService.getFileUploadTask(fileAsReadable, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);
      return await uploadTask.upload();
    } catch (error) {
      createGraphError({
        error,
        messageForUnknownError: 'An unexpected error occurred.',
        knownErrors: [uploadFileExistsKnownError(fileName)],
      });
    }
  }
}

export interface GraphGetParams {
  path: string;
  filter?: string;
  expand?: string;
  top?: number;
  knownErrors?: KnownError[];
}

export interface GraphPostParams {
  path: string;
  requestBody: any;
}

export interface GraphPatchParams<RequestBody> {
  path: string;
  requestBody: RequestBody;
}

export default GraphService;
