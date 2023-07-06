import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { UkefId, UkefSiteId } from '@ukef/helpers';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianCreateAndProvisionRequest } from '../custodian/dto/custodian-create-and-provision-request.dto';
import { GraphGetListItemsResponseDto } from '../graph/dto/graph-get-list-item-response.dto';
import GraphService from '../graph/graph.service';
import { CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFacilityFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { SiteDealFolderNotFoundException } from './exception/site-deal-folder-not-found.exception';

type RequiredSharepointConfigKeys = 'tfisFacilityListId' | 'tfisSharepointUrl' | 'scSharepointUrl' | 'scSiteFullUrl' | 'tfisFacilityHiddenListTermStoreId';
type RequiredCustodianConfigKeys = 'facilityTemplateId' | 'facilityTypeGuid';
@Injectable()
export class SiteDealService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredSharepointConfigKeys>,
    @Inject(CustodianConfig.KEY)
    private readonly custodianConfig: Pick<ConfigType<typeof CustodianConfig>, RequiredCustodianConfigKeys>,
    private readonly graphService: GraphService,
    private readonly custodianService: CustodianService,
  ) {}

  async createFacilityFolder(
    siteId: UkefSiteId,
    dealId: UkefId,
    createFacilityFolderRequestItem: CreateFacilityFolderRequestItem,
  ): Promise<CreateFacilityFolderResponseDto> {
    const { facilityIdentifier, buyerName } = createFacilityFolderRequestItem;

    const parentFolderName = this.getParentFolderName(buyerName, dealId);

    const facilityFolderName = this.getFacilityFolderName(facilityIdentifier);
    const parentFolderId = await this.getParentFolderId(siteId, parentFolderName);
    const termGuid = await this.getTermGuid(facilityIdentifier);
    const termTitle = facilityIdentifier;

    const custodianCreateAndProvisionRequest = this.createCustodianCreateAndProvisionRequest(facilityFolderName, parentFolderId, termGuid, termTitle);

    await this.custodianService.createAndProvision(custodianCreateAndProvisionRequest);

    return {
      folderName: facilityFolderName,
    };
  }

  private getFacilityFolderName(facilityIdentifier: string): string {
    return `F ${facilityIdentifier}`;
  }

  private getParentFolderName(buyerName: string, dealId: string): string {
    return `${buyerName}/D ${dealId}`;
  }

  private async getParentFolderId(siteId: UkefSiteId, parentFolderName: string): Promise<number> {
    const parentFolderData: GraphGetListItemsResponseDto = await this.graphService.get({
      path: `${this.sharepointConfig.scSharepointUrl}:/lists/${this.sharepointConfig.tfisFacilityListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${parentFolderName}'`,
      expand: 'fields($select=Title,ServerRelativeUrl,Code,ID,ParentCode)',
    });

    if (!parentFolderData.value.length || !parentFolderData.value[0].fields.id) {
      throw new SiteDealFolderNotFoundException(
        `Site deal folder not found: ${parentFolderName}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      );
    }

    const parentFolderId = parseInt(parentFolderData.value[0].fields.id);
    if (isNaN(parentFolderId)) {
      throw new SiteDealFolderNotFoundException(
        `Site deal folder not found: ${parentFolderName}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      );
    }

    return parentFolderId;
  }

  private async getTermGuid(facilityIdentifier: string) {
    const facilityTermData: GraphGetListItemsResponseDto = await this.graphService.get({
      path: `${this.sharepointConfig.tfisSharepointUrl}:/lists/${this.sharepointConfig.tfisFacilityHiddenListTermStoreId}/items`,
      filter: `fields/Title eq '${facilityIdentifier}' and fields/FacilityGUID ne null`,
      expand: 'fields($select=FacilityGUID,Title)',
    });

    if (!facilityTermData.value.length || !facilityTermData.value[0].fields.FacilityGUID) {
      throw new SiteDealFolderNotFoundException(`Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /terms/facility`);
    }

    return facilityTermData.value[0].fields.FacilityGUID;
  }

  private createCustodianCreateAndProvisionRequest(
    facilityFolderName: string,
    parentFolderId: number,
    termGuid: string,
    termTitle: string,
  ): CustodianCreateAndProvisionRequest {
    return {
      Title: facilityFolderName,
      Id: 0,
      Code: '',
      TemplateId: this.custodianConfig.facilityTemplateId,
      ParentId: parentFolderId,
      InterestedParties: '',
      Secure: false,
      DoNotSubscribeInterestedParties: false,
      Links: [],
      FormButton: '',
      HasAttachments: false,
      Metadata: [
        {
          Name: 'Facility ID',
          Values: [`${termGuid}||${termTitle}`],
        },
      ],
      TypeGuid: this.custodianConfig.facilityTypeGuid,
      SPHostUrl: this.sharepointConfig.scSiteFullUrl,
    };
  }
}
