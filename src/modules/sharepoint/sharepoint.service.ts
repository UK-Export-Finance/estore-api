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
  top?: number;
}

export interface SharepointCreateSiteParams {
  exporterName: string;
  newSiteId: string;
}

export interface SharepointGetDealFolderParams {
  siteId: string;
  dealFolderName: string;
}

export interface SharepointGetFacilityFolderParams {
  siteId: string;
  facilityFolderName: string;
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

export interface SharepointupdateFileInformationParams {
  urlToUpdateFileInfo: string;
  requestBodyToUpdateFileInfo: {
    contentType: {
      id: string;
    };
    fields: {
      Title: string;
      Document_x0020_Status: string;
      [documentTypeIdFieldName: string]: string;
    };
  };
}

interface SharepointFindListItemsBase<Fields> {
  siteUrl: string;
  fieldsToReturn: (keyof Fields)[];
  filter: ListItemFilter;
}
interface SharepointFindListItemsByTitle<Fields> extends SharepointFindListItemsBase<Fields> {
  listId?: never;
  listTitle: string;
}

interface SharepointFindListItemsById<Fields> extends SharepointFindListItemsBase<Fields> {
  listId: string;
  listTitle?: never;
}

export type SharepointFindListItems<Fields> = SharepointFindListItemsById<Fields> | SharepointFindListItemsByTitle<Fields>;

export interface SharepointFindListItemsSimple<Fields> {
  siteUrl: string;
  fieldsToReturn: (keyof Fields)[];
  filter: ListItemFilter;
  listId?: string;
  listTitle?: string;
}

@Injectable()
export class SharepointService {
  constructor(
    private readonly graphService: GraphService,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: ConfigType<typeof SharepointConfig>,
  ) {}

  getSiteByUkefSiteId(ukefSiteId: string): Promise<{ id: string }> {
    return this.graphService.get<{ id: string }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}`,
    });
  }

  getResources({ ukefSiteId, sharepointResourceType }: SharepointGetResourcesParams): Promise<{ value: { name: string; id: string }[] }> {
    return this.graphService.get<{ value: { name: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/${sharepointResourceType}s`,
    });
  }

  getItems({ ukefSiteId, listId, top }: SharepointGetItemsParams): Promise<{ value: { webUrl: string; id: string }[] }> {
    return this.graphService.get<{ value: { webUrl: string; id: string }[] }>({
      path: `sites/${this.sharepointConfig.ukefSharepointName}:/sites/${ukefSiteId}:/lists/${listId}/items`,
      top,
    });
  }

  getExporterSite(exporterName: string): Promise<
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
    return this.findListItems<{ Title: string; URL: string; Sitestatus: string; TermGuid: string; SiteURL: { Url: string } }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisCaseSitesListId,
      fieldsToReturn: ['Title', 'URL', 'Sitestatus', 'TermGuid', 'SiteURL'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });
  }

  getBuyerFolder({ siteId, buyerName }: SharepointGetBuyerFolderParams): Promise<ListItem<{ id: string }>[]> {
    return this.findListItems<{ id: string }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.tfisDealListId,
      fieldsToReturn: ['id'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${buyerName}` }),
    });
  }

  getMarketTerm(marketName: string): Promise<ListItem<{ TermGuid: string }>[]> {
    return this.findListItems<{ TermGuid: string }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.taxonomyHiddenListTermStoreListId,
      fieldsToReturn: ['TermGuid'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: marketName }),
    });
  }

  getDealFolder({
    siteId,
    dealFolderName,
  }: SharepointGetDealFolderParams): Promise<ListItem<{ Title: string; ServerRelativeUrl: string; Code: string; id: string; ParentCode: string }>[]> {
    return this.findListItems<{
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

  getFacilityFolder({
    siteId,
    facilityFolderName,
  }: SharepointGetFacilityFolderParams): Promise<ListItem<{ Title: string; ServerRelativeUrl: string; Code: string; id: string; ParentCode: string }>[]> {
    return this.findListItems<{
      Title: string;
      ServerRelativeUrl: string;
      Code: string;
      id: string;
      ParentCode: string;
    }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listTitle: this.sharepointConfig.tfisFacilityListTitle,
      fieldsToReturn: ['Title', 'ServerRelativeUrl', 'Code', 'id', 'ParentCode'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'ServerRelativeUrl', targetValue: `/sites/${siteId}/CaseLibrary/${facilityFolderName}` }),
    });
  }

  getFacilityTerm(facilityIdentifier: string): Promise<ListItem<{ FacilityGUID: string; Title: string }>[]> {
    return this.findListItems<{ FacilityGUID: string; Title: string }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisFacilityHiddenListTermStoreId,
      fieldsToReturn: ['FacilityGUID', 'Title'],
      filter: new AndListItemFilter(
        new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: facilityIdentifier }),
        new FieldNotNullListItemFilter({ fieldName: 'FacilityGUID' }),
      ),
    });
  }

  getCaseSite(siteId: string): Promise<ListItem<{ id: string; CustodianSiteURL: string }>[]> {
    return this.findListItems<{
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

  createSite({ exporterName, newSiteId }: SharepointCreateSiteParams): Promise<GraphCreateSiteResponseDto> {
    return this.graphService.post<GraphCreateSiteResponseDto>({
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

  async updateFileInformation({ urlToUpdateFileInfo, requestBodyToUpdateFileInfo }: SharepointupdateFileInformationParams): Promise<void> {
    await this.graphService.patch<
      {
        contentType: {
          id: string;
        };
        fields: {
          Title: string;
          Document_x0020_Status: string;
          [documentTypeIdFieldName: string]: string;
        };
      },
      unknown
    >({
      path: urlToUpdateFileInfo,
      requestBody: requestBodyToUpdateFileInfo,
    });
  }

  uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession }: SharepointUploadFileParams): Promise<UploadResult> {
    return this.graphService.uploadFile({ file, fileSizeInBytes, fileName, urlToCreateUploadSession });
  }

  private async findListItems<Fields>({ siteUrl, listId, listTitle, fieldsToReturn, filter }: SharepointFindListItems<Fields>): Promise<ListItem<Fields>[]> {
    const commaSeparatedListOfFieldsToReturn = fieldsToReturn.join(',');
    const { value: listItemsMatchingFilter } = await this.graphService.get<{ value: ListItem<Fields>[] }>({
      path: `${siteUrl}/lists/${listId || listTitle}/items`,
      filter: filter.getFilterString(),
      expand: `fields($select=${commaSeparatedListOfFieldsToReturn})`,
    });
    return listItemsMatchingFilter;
  }
}
