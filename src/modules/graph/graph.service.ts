import { Client, GraphRequest, LargeFileUploadSession, LargeFileUploadTaskOptions, UploadResult } from '@microsoft/microsoft-graph-client';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import GraphClientService from '@ukef/modules/graph-client/graph-client.service';
import { Readable } from 'stream';

import { ListItem } from '../sharepoint/list-item.interface';
import { FieldEqualsListItemFilter } from '../sharepoint/list-item-filter/field-equals.list-item-filter';
import { ListItemFilter } from '../sharepoint/list-item-filter/list-item-filter.interface';
import { createGraphError } from './create-graph-error';
import { GraphCreateSiteResponseDto } from './dto/graph-create-site-response.dto';
import { KnownError, postFacilityTermExistsKnownError, uploadFileExistsKnownError, uploadFileSiteNotFoundKnownError } from './known-errors';
import { UkefId } from '@ukef/helpers';
import { AndListItemFilter } from '../sharepoint/list-item-filter/and.list-item-filter';
import { FieldNotNullListItemFilter } from '../sharepoint/list-item-filter/field-not-null.list-item-filter';
import { SharepointResourceTypeEnum } from '@ukef/constants/enums/sharepoint-resource-type';

// Todo apim-472 We can probably remove the need for this
type RequiredConfigKeys =
  | 'tfisSharepointUrl'
  | 'tfisCaseSitesListId'
  | 'tfisFacilityHiddenListTermStoreId'
  | 'tfisFacilityListId'
  | 'tfisDealListId'
  | 'scSharepointUrl'
  | 'scSiteFullUrl'
  | 'taxonomyHiddenListTermStoreListId'
  | 'scCaseSitesListId'
  | 'ukefSharepointName';

@Injectable()
export class GraphService {
  private readonly client: Client;

  constructor(
    private readonly graphClientService: GraphClientService,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
  ) {
    this.client = graphClientService.client;
  }

  async uploadFileInformation({
    urlToUpdateFileInfo,
    requestBodyToUpdateFileInfo,
  }: {
    urlToUpdateFileInfo: string;
    requestBodyToUpdateFileInfo: {
      Title: string;
      Document_x0020_Status: string;
    };
  }) {
    await this.patch<
      {
        Title: string;
        Document_x0020_Status: string;
      },
      unknown
    >({
      path: urlToUpdateFileInfo,
      requestBody: requestBodyToUpdateFileInfo,
    });
  }

  // TODO apim-472 I feel we might want to move these all to the sharepoint service, and keep the graph service lean.

  async postFacilityToTermStore(id: string): Promise<void> {
    await this.post<any>({
      path: `${this.sharepointConfig.tfisSharepointUrl}/lists/${this.sharepointConfig.tfisFacilityHiddenListTermStoreId}/items`,
      requestBody: {
        fields: {
          Title: id,
        },
      },
    });
  }

  async createSite({ exporterName, newSiteId }) {
    return await this.post<GraphCreateSiteResponseDto>({
      path: `${this.sharepointConfig.tfisSharepointUrl}/lists/${this.sharepointConfig.tfisCaseSitesListId}/items`,
      requestBody: {
        fields: {
          Title: exporterName,
          URL: newSiteId,
          HomePage: exporterName,
          Description: exporterName,
        },
      },
    });
  }

  async getSiteByUkefSiteId(ukefSiteId: string) {
    return await this.get<{ id: string }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}`,
    });
  }

  async getResources({ ukefSiteId, sharepointResourceType }: { ukefSiteId: string; sharepointResourceType: SharepointResourceTypeEnum }) {
    return await this.get<{ value: { name: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/${sharepointResourceType}s`,
    });
  }

  async getItems({ ukefSiteId, listId }: { ukefSiteId: string; listId: string }) {
    return await this.get<{ value: { webUrl: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/lists/${listId}/items`,
    });
  }

  async getSiteFromSiteListByExporterName(exporterName) {
    return await this.findListItems<{ Title: string; URL: string; Sitestatus: string }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisCaseSitesListId,
      fieldsToReturn: ['Title', 'URL', 'Sitestatus'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });
  }

  // TODO apim-472 - There is a question here about how specific we want these to be named. I've used generic naming with the idea it can
  // be expanded with different fields in the future.

  // TODO apim-472 tests (both graph service and originator service)
  async getBuyerFolder({ siteId, buyerName }: { siteId: string; buyerName: string }) {
    return await this.findListItems<{ id: string }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.tfisDealListId,
      fieldsToReturn: ['id'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${buyerName}` }),
    });
  }

  // TODO apim-472 tests (both graph service and originator service)
  async getExporter(exporterName: string) {
    return await this.findListItems<{ TermGuid: string; URL: string; Title: string; SiteURL: { Url: string } }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisCaseSitesListId,
      fieldsToReturn: ['TermGuid', 'URL', 'Title', `SiteURL`],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });
  }

  // TODO apim-472 tests (both graph service and originator service)
  async getMarketTerm(marketName: string) {
    return await this.findListItems<{ TermGuid: string }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.taxonomyHiddenListTermStoreListId,
      fieldsToReturn: ['TermGuid'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: marketName }),
    });
  }

  // TODO apim-472 tests (both graph service and originator service)
  async getParentFolder({ siteId, parentFolderName }: { siteId: string; parentFolderName: string }) {
    return await this.findListItems<{
      Title: string;
      ServerRelativeUrl: string;
      Code: string;
      id: string;
      ParentCode: string;
    }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.tfisFacilityListId,
      fieldsToReturn: ['Title', 'ServerRelativeUrl', 'Code', 'id', 'ParentCode'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${parentFolderName}` }),
    });
  }

  // TODO apim-472 tests (both graph service and originator service)
  async getTerm(facilityIdentifier: string) {
    return await this.findListItems<{ FacilityGUID: string; Title: string }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisFacilityHiddenListTermStoreId,
      fieldsToReturn: ['FacilityGUID', 'Title'],
      filter: new AndListItemFilter(
        new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: facilityIdentifier }),
        new FieldNotNullListItemFilter({ fieldName: 'FacilityGUID' }),
      ),
    });
  }

  // TODO apim-472 tests (both graph service and originator service)
  async getCaseSite(siteId: string) {
    return await this.findListItems<{
      id: string;
      CustodianSiteURL: string;
    }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.scCaseSitesListId,
      fieldsToReturn: ['id', 'CustodianSiteURL'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'CustodianSiteURL', targetValue: siteId }),
    });
  }

  // TODO apim-472: tests (commonise existing)
  private async findListItems<Fields>({
    siteUrl,
    listId,
    fieldsToReturn,
    filter,
  }: {
    siteUrl: string;
    listId: string;
    fieldsToReturn: (keyof Fields)[];
    filter: ListItemFilter;
  }): Promise<ListItem<Fields>[]> {
    const commaSeparatedListOfFieldsToReturn = fieldsToReturn.join(',');
    const { value: listItemsMatchingFilter } = await this.get<{ value: ListItem<Fields>[] }>({
      path: `${siteUrl}/lists/${listId}/items`,
      filter: filter.getFilterString(),
      expand: `fields($select=${commaSeparatedListOfFieldsToReturn})`,
    });

    return listItemsMatchingFilter;
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
