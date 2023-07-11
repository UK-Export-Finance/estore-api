import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { UkefId, UkefSiteId } from '@ukef/helpers';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianCreateAndProvisionRequest } from '../custodian/dto/custodian-create-and-provision-request.dto';
import { AndListItemFilter } from '../sharepoint/list-item-filter/and.list-item-filter';
import { FieldEqualsListItemFilter } from '../sharepoint/list-item-filter/field-equals.list-item-filter';
import { FieldNotNullListItemFilter } from '../sharepoint/list-item-filter/field-not-null.list-item-filter';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFolderResponseDto } from './dto/create-facility-folder-response.dto';
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
    private readonly sharepointService: SharepointService,
    private readonly custodianService: CustodianService,
  ) {}

  async createFacilityFolder(
    siteId: UkefSiteId,
    dealId: UkefId,
    createFacilityFolderRequestItem: CreateFacilityFolderRequestItem,
  ): Promise<CreateFolderResponseDto> {
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
    const parentFolderListItems = await this.sharepointService.findListItems<{
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

    if (!parentFolderListItems.length || !parentFolderListItems[0].fields.id) {
      throw new SiteDealFolderNotFoundException(
        `Site deal folder not found: ${parentFolderName}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      );
    }

    const parentFolderId = parseInt(parentFolderListItems[0].fields.id);
    if (isNaN(parentFolderId)) {
      throw new SiteDealFolderNotFoundException(
        `Site deal folder not found: ${parentFolderName}. Once requested, in normal operation, it will take 5 seconds to create the deal folder`,
      );
    }

    return parentFolderId;
  }

  private async getTermGuid(facilityIdentifier: string) {
    const facilityTermListItems = await this.sharepointService.findListItems<{ FacilityGUID: string; Title: string }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisFacilityHiddenListTermStoreId,
      fieldsToReturn: ['FacilityGUID', 'Title'],
      filter: new AndListItemFilter(
        new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: facilityIdentifier }),
        new FieldNotNullListItemFilter({ fieldName: 'FacilityGUID' }),
      ),
    });

    if (!facilityTermListItems.length || !facilityTermListItems[0].fields.FacilityGUID) {
      throw new SiteDealFolderNotFoundException(`Facility term folder not found: ${facilityIdentifier}. To create this resource, call POST /terms/facility`);
    }

    return facilityTermListItems[0].fields.FacilityGUID;
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
