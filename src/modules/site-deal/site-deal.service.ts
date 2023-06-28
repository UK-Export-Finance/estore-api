import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { UkefId, UkefSiteId } from '@ukef/helpers';

import { GraphGetListItemsResponseDto } from '../graph/dto/graph-get-list-item-response.dto';
import GraphService from '../graph/graph.service';
import { CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFacilityFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { SiteDealException } from './exception/site-deal.exception';
import { SiteDealFolderNotFoundException } from './exception/site-deal-folder-not-found.exception';

type RequiredConfigKeys = 'tfisFacilityListId' | 'ukefSharepointName' | 'tfisSiteName' | 'tfisListId' | 'tfisScSiteName' | 'tfisFacilityHiddenListTermStoreId';

@Injectable()
export class SiteDealService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly config: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
    private readonly graphService: GraphService,
  ) {}

  async createFacilityFolder(
    siteId: UkefSiteId,
    dealId: UkefId,
    createFacilityFolderRequestItem: CreateFacilityFolderRequestItem,
  ): Promise<CreateFacilityFolderResponseDto> {
    const { facilityIdentifier, buyerName, destinationMarket, riskMarket } = createFacilityFolderRequestItem;

    const parentFolderName = this.getParentFolderName(buyerName, dealId);

    // TODO apim-139: plug into new function
    const parentFolder = await this.getParentFolderId(siteId, parentFolderName);
    const termGuid = await this.getTermGuid(facilityIdentifier);
    const termTitle = facilityIdentifier;

    // TODO apim-139: update response
    return {
      folderName: `${destinationMarket} - ${riskMarket} - ${parentFolder} - ${termGuid}- ${termTitle} - ${parentFolderName}`,
    };
  }

  private getFacilityFolderName(facilityIdentifier: string): string {
    return `F ${facilityIdentifier}`;
  }

  private getParentFolderName(buyerName: string, dealId: string): string {
    return `${buyerName}/D ${dealId}`;
  }

  private async getParentFolderId(siteId: UkefSiteId, parentFolderName: string): Promise<string> {
    const parentFolderData: GraphGetListItemsResponseDto = await this.graphService.get({
      path: `sites/${this.config.ukefSharepointName}:/sites/${this.config.tfisScSiteName}:/lists/${this.config.tfisFacilityListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${parentFolderName}'`,
      expand: 'fields($select=Title,ServerRelativeUrl,Code,ID,ParentCode)',
    });

    if (!parentFolderData.value.length) {
      throw new SiteDealFolderNotFoundException(
        `Site deal folder not found: ${parentFolderName}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      );
    }

    if (!parentFolderData.value[0].fields.id) {
      throw new SiteDealException(
        `Site deal folder ${parentFolderName} has no id. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      );
    }

    return parentFolderData.value[0].fields.id;
  }

  private async getTermGuid(facilityIdentifier: string) {
    const facilityTermData: GraphGetListItemsResponseDto = await this.graphService.get({
      path: `sites/${this.config.ukefSharepointName}:/sites/${this.config.tfisSiteName}:/lists/${this.config.tfisFacilityHiddenListTermStoreId}/items`,
      filter: `fields/Title eq '${facilityIdentifier}' and fields/FacilityGUID ne null`,
      expand: 'fields($select=FacilityGUID,Title)',
    });

    if (!facilityTermData.value.length) {
      throw new SiteDealFolderNotFoundException(`Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /term/facility`);
    }

    if (!facilityTermData.value[0].fields.FacilityGUID) {
      throw new SiteDealException(
        `Facility term folder ${facilityIdentifier} is missing facility term GUID. To create this resource, call POST /term/facility`,
      );
    }

    return facilityTermData.value[0].fields.FacilityGUID;
  }
}
