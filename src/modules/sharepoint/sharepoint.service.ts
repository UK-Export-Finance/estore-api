import { UploadResult } from '@microsoft/microsoft-graph-client';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { SharepointResourceTypeEnum } from '@ukef/constants/enums/sharepoint-resource-type';
import GraphService from '@ukef/modules/graph/graph.service';

import { GraphCreateSiteResponseDto } from '../graph/dto/graph-create-site-response.dto';
import { ListItem } from './list-item.interface';
import { AndListItemFilter } from './list-item-filter/and.list-item-filter';
import { FieldEqualsListItemFilter } from './list-item-filter/field-equals.list-item-filter';
import { FieldNotNullListItemFilter } from './list-item-filter/field-not-null.list-item-filter';
import { ListItemFilter } from './list-item-filter/list-item-filter.interface';

@Injectable()
export class SharepointService {
  constructor(
    private readonly graphService: GraphService,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: ConfigType<typeof SharepointConfig>,
  ) {}

  async getSiteByUkefSiteId(ukefSiteId: string) {
    return await this.graphService.get<{ id: string }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}`,
    });
  }

  async getResources({ ukefSiteId, sharepointResourceType }: { ukefSiteId: string; sharepointResourceType: SharepointResourceTypeEnum }) {
    return await this.graphService.get<{ value: { name: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/${sharepointResourceType}s`,
    });
  }

  async getItems({ ukefSiteId, listId }: { ukefSiteId: string; listId: string }) {
    return await this.graphService.get<{ value: { webUrl: string; id: string }[] }>({
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

  async postFacilityToTermStore(id: string): Promise<void> {
    await this.graphService.post<any>({
      path: `${this.sharepointConfig.tfisSharepointUrl}/lists/${this.sharepointConfig.tfisFacilityHiddenListTermStoreId}/items`,
      requestBody: {
        fields: {
          Title: id,
        },
      },
    });
  }

  async createSite({ exporterName, newSiteId }) {
    return await this.graphService.post<GraphCreateSiteResponseDto>({
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
    await this.graphService.patch<
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
    return await this.graphService.uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession });
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
    const test = await this.graphService.get<{ value: ListItem<Fields>[] }>({
      path: `${siteUrl}/lists/${listId}/items`,
      filter: filter.getFilterString(),
      expand: `fields($select=${commaSeparatedListOfFieldsToReturn})`,
    });
    return test.value;
  }
}
