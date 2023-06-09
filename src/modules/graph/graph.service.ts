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
import { KnownError, postFacilityTermExistsKnownError, uploadFileExistsKnownError, uploadFileSiteNotFoundKnownError } from './known-errors';

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
        knownErrors: knownErrors ?? [uploadFileSiteNotFoundKnownError()],
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

  async uploadFile(file: NodeJS.ReadableStream, fileSizeInBytes: number, fileName: string, urlToCreateUploadSession: string): Promise<UploadResult> {
    try {
      const uploadSession: LargeFileUploadSession = await LargeFileUploadTask.createUploadSession(this.client, urlToCreateUploadSession, {
        item: {
          '@microsoft.graph.conflictBehavior': 'fail',
        },
      });
      const fileAsReadable = new Readable().wrap(file);
      const options: LargeFileUploadTaskOptions = {
        rangeSize: fileSizeInBytes,
      };
      const uploadTask = new LargeFileUploadTask(this.client, new StreamUpload(fileAsReadable, fileName, fileSizeInBytes), uploadSession, options);
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
