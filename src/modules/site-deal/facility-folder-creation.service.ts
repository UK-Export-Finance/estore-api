import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { UkefId } from '@ukef/helpers';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianCreateAndProvisionRequest } from '../custodian/dto/custodian-create-and-provision-request.dto';
import GraphService from '../graph/graph.service';
import { AndListItemFilter } from '../sharepoint/list-item-filter/and.list-item-filter';
import { FieldEqualsListItemFilter } from '../sharepoint/list-item-filter/field-equals.list-item-filter';
import { FieldNotNullListItemFilter } from '../sharepoint/list-item-filter/field-not-null.list-item-filter';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { FolderDependencyInvalidException } from './exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';

type RequiredCustodianConfigKeys = 'facilityTemplateId' | 'facilityTypeGuid';

@Injectable()
export class FacilityFolderCreationService {
  constructor(
    @Inject(CustodianConfig.KEY)
    private readonly custodianConfig: Pick<ConfigType<typeof CustodianConfig>, RequiredCustodianConfigKeys>,
    private readonly graphServive: GraphService,
    private readonly custodianService: CustodianService,
  ) {}

  async createFacilityFolder(
    siteId: string,
    dealId: UkefId,
    createFacilityFolderRequestItem: CreateFacilityFolderRequestItem,
  ): Promise<CreateFolderResponseDto> {
    const { facilityIdentifier, buyerName } = createFacilityFolderRequestItem;

    const dealFolderName = this.getDealFolderName(buyerName, dealId);
    const facilityFolderName = this.getFacilityFolderName(facilityIdentifier);

    const dealFolderId = await this.getDealFolderId(siteId, dealFolderName);
    const termGuid = await this.getTermGuid(facilityIdentifier);
    const termTitle = facilityIdentifier;

    const custodianCreateAndProvisionRequest = this.createCustodianCreateAndProvisionRequest(facilityFolderName, dealFolderId, termGuid, termTitle);

    await this.custodianService.createAndProvision(custodianCreateAndProvisionRequest);

    return {
      folderName: facilityFolderName,
    };
  }

  private getFacilityFolderName(facilityIdentifier: string): string {
    return `F ${facilityIdentifier}`;
  }

  private getDealFolderName(buyerName: string, dealId: string): string {
    return `${buyerName}/D ${dealId}`;
  }

  private async getDealFolderId(siteId: string, dealFolderName: string): Promise<number> {
    const dealFolderListItems = await this.sharepointService.findListItems<{
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

    if (!dealFolderListItems.length) {
      throw new FolderDependencyNotFoundException(
        `Site deal folder not found: ${dealFolderName}. Once requested, in normal operation, it will take 5 seconds to create the deal folder.`,
      );
    }

    const dealFolderIdString = dealFolderListItems[0].fields.id;
    if (!dealFolderIdString) {
      throw new FolderDependencyInvalidException(`Missing id for the deal folder ${dealFolderName} in site ${siteId}.`);
    }

    const dealFolderId = parseInt(dealFolderIdString);
    if (isNaN(dealFolderId)) {
      throw new FolderDependencyInvalidException(
        `The id for the deal folder ${dealFolderName} in site ${siteId} is not a number (the value is ${dealFolderIdString}).`,
      );
    }

    return dealFolderId;
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

    if (!facilityTermListItems.length) {
      throw new FolderDependencyNotFoundException(`Facility term not found: ${facilityIdentifier}. To create this resource, call POST /terms/facilities.`);
    }

    const facilityGuid = facilityTermListItems[0].fields.FacilityGUID;
    if (!facilityGuid) {
      throw new FolderDependencyInvalidException(`Missing FacilityGUID for facility term ${facilityIdentifier}.`);
    }

    return facilityGuid;
  }

  // TODO apim-472 rework this so there is no sharepointConfig call
  private createCustodianCreateAndProvisionRequest(
    facilityFolderName: string,
    dealFolderId: number,
    termGuid: string,
    termTitle: string,
  ): CustodianCreateAndProvisionRequest {
    return {
      Title: facilityFolderName,
      Id: 0,
      Code: '',
      TemplateId: this.custodianConfig.facilityTemplateId,
      ParentId: dealFolderId,
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
