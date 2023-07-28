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

export interface SharepointGetResourcesParams {
  ukefSiteId: string;
  sharepointResourceType: SharepointResourceTypeEnum;
}

export interface SharepointGetItemsParams {
  ukefSiteId: string;
  listId: string;
}

export interface SharepointCreateSiteParams {
  exporterName: string;
  newSiteId: string;
}

export interface SharepointGetDealFolderParams {
  siteId: string;
  dealFolderName: string;
}

export interface SharepointGetBuyerFolderParams {
  siteId: string;
  buyerName: string;
}

export interface SharepointUploadFileParams {
  file: NodeJS.ReadableStream;
  fileSizeInBytes: number;
  fileName: string;
  urlToCreateUploadSession: string;
}

export interface SharepointFindListItems<Fields> {
  siteUrl: string;
  listId: string;
  fieldsToReturn: (keyof Fields)[];
  filter: ListItemFilter;
}

@Injectable()
export class SharepointService {
  constructor(
    private readonly graphService: GraphService,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: ConfigType<typeof SharepointConfig>,
  ) {}

  async getSiteByUkefSiteId(ukefSiteId: string): Promise<{ id: string }> {
    return await this.graphService.get<{ id: string }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}`,
    });
  }

  async getResources({ ukefSiteId, sharepointResourceType }: SharepointGetResourcesParams): Promise<{ value: { name: string; id: string }[] }> {
    return await this.graphService.get<{ value: { name: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/${sharepointResourceType}s`,
    });
  }

  async getItems({ ukefSiteId, listId }: SharepointGetItemsParams): Promise<{ value: { webUrl: string; id: string }[] }> {
    return await this.graphService.get<{ value: { webUrl: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/lists/${listId}/items`,
    });
  }

  async getExporterSite(exporterName: string): Promise<
    ListItem<{
      Title: string;
      URL: string;
      Sitestatus: string;
      TermGuid: string;
      SiteURL: {
        Url: string;
      };
    }>[]
  > {
    return await this.findListItems<{ Title: string; URL: string; Sitestatus: string; TermGuid: string; SiteURL: { Url: string } }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisCaseSitesListId,
      fieldsToReturn: ['Title', 'URL', 'Sitestatus', 'TermGuid', 'SiteURL'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });
  }

  async getBuyerFolder({ siteId, buyerName }: SharepointGetBuyerFolderParams): Promise<ListItem<{ id: string }>[]> {
    return await this.findListItems<{ id: string }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.tfisDealListId,
      fieldsToReturn: ['id'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${buyerName}` }),
    });
  }

  async getMarketTerm(marketName: string): Promise<ListItem<{ TermGuid: string }>[]> {
    return await this.findListItems<{ TermGuid: string }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.taxonomyHiddenListTermStoreListId,
      fieldsToReturn: ['TermGuid'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: marketName }),
    });
  }

  async getDealFolder({
    siteId,
    dealFolderName,
  }: SharepointGetDealFolderParams): Promise<ListItem<{ Title: string; ServerRelativeUrl: string; Code: string; id: string; ParentCode: string }>[]> {
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
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${dealFolderName}` }),
    });
  }

  async getFacilityTerm(facilityIdentifier: string): Promise<ListItem<{ FacilityGUID: string; Title: string }>[]> {
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

  async getCaseSite(siteId: string): Promise<ListItem<{ id: string; CustodianSiteURL: string }>[]> {
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

  async createSite({ exporterName, newSiteId }: SharepointCreateSiteParams): Promise<GraphCreateSiteResponseDto> {
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
  }): Promise<void> {
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

  async uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession }: SharepointUploadFileParams): Promise<UploadResult> {
    return await this.graphService.uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession });
  }

  private async findListItems<Fields>({ siteUrl, listId, fieldsToReturn, filter }: SharepointFindListItems<Fields>): Promise<ListItem<Fields>[]> {
    const commaSeparatedListOfFieldsToReturn = fieldsToReturn.join(',');
    const { value: listItemsMatchingFilter } = await this.graphService.get<{ value: ListItem<Fields>[] }>({
      path: `${siteUrl}/lists/${listId}/items`,
      filter: filter.getFilterString(),
      expand: `fields($select=${commaSeparatedListOfFieldsToReturn})`,
    });
    return listItemsMatchingFilter;
  }
}
