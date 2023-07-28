import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { CustodianService } from '@ukef/modules/custodian/custodian.service';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { FieldEqualsListItemFilter } from '@ukef/modules/sharepoint/list-item-filter/field-equals.list-item-filter';

import { FolderDependencyInvalidException } from './exception/folder-dependency-invalid.exception';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';

type RequiredCustodianConfigKeys = 'dealTemplateId' | 'dealTypeGuid';
type RequiredSharepointConfigKeys = 'scSiteFullUrl';

@Injectable()
export class DealFolderCreationService {
  constructor(
    @Inject(CustodianConfig.KEY)
    private readonly custodianConfig: Pick<ConfigType<typeof CustodianConfig>, RequiredCustodianConfigKeys>,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredSharepointConfigKeys>,
    private readonly sharepointService: SharepointService,
    private readonly custodianService: CustodianService,
  ) {}

  async createDealFolder({
    siteId,
    dealIdentifier,
    buyerName,
    exporterName,
    destinationMarket,
    riskMarket,
  }: {
    siteId: string;
    dealIdentifier: string;
    buyerName: string;
    exporterName: string;
    destinationMarket: string;
    riskMarket: string;
  }): Promise<string> {
    const buyerFolderId = await this.getBuyerFolderId({ siteId, buyerName });
    const { exporterTermGuid, exporterUrl } = await this.getExporterDetails({ siteId, exporterName });
    const destinationMarketTermGuid = await this.getMarketTermGuid(destinationMarket);
    const riskMarketTermGuid = await this.getMarketTermGuid(riskMarket);
    const dealFolderName = this.generateDealFolderName(dealIdentifier);

    await this.sendCreateAndProvisionRequestForDealFolder({
      dealIdentifier,
      dealFolderName,
      buyerFolderId,
      exporterTermGuid,
      exporterUrl,
      destinationMarket,
      destinationMarketTermGuid,
      riskMarket,
      riskMarketTermGuid,
    });
    return dealFolderName;
  }

  private async getBuyerFolderId({ siteId, buyerName }: { siteId: string; buyerName: string }): Promise<number> {
    const buyerFolderSearchResults = await this.sharepointService.getBuyerFolder({ siteId, buyerName });
    if (buyerFolderSearchResults.length === 0) {
      throw new FolderDependencyNotFoundException(`Did not find a folder for buyer ${buyerName} in site ${siteId}.`);
    }
    const [
      {
        fields: { id: buyerFolderIdString },
      },
    ] = buyerFolderSearchResults;
    if (!buyerFolderIdString) {
      throw new FolderDependencyInvalidException(`Missing id for the folder found for ${buyerName} in site ${siteId}.`);
    }
    const buyerFolderId = parseInt(buyerFolderIdString, 10);
    if (isNaN(buyerFolderId)) {
      throw new FolderDependencyInvalidException(
        `The id for the folder found for ${buyerName} in site ${siteId} is not a number (the value is ${buyerFolderIdString}).`,
      );
    }
    return buyerFolderId;
  }

  private async getExporterDetails({
    siteId,
    exporterName,
  }: {
    siteId: string;
    exporterName: string;
  }): Promise<{ exporterTermGuid: string; exporterUrl: string }> {
    const exporterTermSearchResults = await this.sharepointService.getExporterSite(exporterName);
    if (exporterTermSearchResults.length === 0) {
      throw new FolderDependencyNotFoundException(`Did not find the exporterName ${exporterName} in the tfisCaseSitesList.`);
    }
    const [
      {
        fields: { TermGuid: exporterTermGuid, URL: exporterUrl },
      },
    ] = exporterTermSearchResults;
    if (!exporterTermGuid) {
      throw new FolderDependencyInvalidException(`Missing TermGuid for the list item found for exporter ${exporterName} in site ${siteId}.`);
    }
    if (!exporterUrl) {
      throw new FolderDependencyInvalidException(`Missing URL for the list item found for exporter ${exporterName} in site ${siteId}.`);
    }
    return { exporterTermGuid, exporterUrl };
  }

  private async getMarketTermGuid(marketName: string): Promise<string> {
    const marketTermSearchResults = await this.sharepointService.getMarketTerm(marketName);
    if (marketTermSearchResults.length === 0) {
      throw new FolderDependencyNotFoundException(`Did not find the market ${marketName} in the taxonomyHiddenListTermStore.`);
    }
    const [
      {
        fields: { TermGuid: marketTermGuid },
      },
    ] = marketTermSearchResults;
    if (!marketTermGuid) {
      throw new FolderDependencyInvalidException(`Missing TermGuid for the market list item found for ${marketName}.`);
    }
    return marketTermGuid;
  }

  private generateDealFolderName(dealIdentifier: string): string {
    return `D ${dealIdentifier}`;
  }

  private async sendCreateAndProvisionRequestForDealFolder({
    dealIdentifier,
    dealFolderName,
    buyerFolderId,
    exporterTermGuid,
    exporterUrl,
    destinationMarket,
    destinationMarketTermGuid,
    riskMarket,
    riskMarketTermGuid,
  }: {
    dealIdentifier: string;
    dealFolderName: string;
    buyerFolderId: number;
    exporterTermGuid: string;
    exporterUrl: string;
    destinationMarket: string;
    destinationMarketTermGuid: string;
    riskMarket: string;
    riskMarketTermGuid: string;
  }): Promise<void> {
    const createFolderRequest: CustodianCreateAndProvisionRequest = {
      Title: dealFolderName,
      Id: 0,
      Code: '',
      TemplateId: this.custodianConfig.dealTemplateId,
      ParentId: buyerFolderId,
      InterestedParties: '',
      Secure: false,
      DoNotSubscribeInterestedParties: false,
      Links: [],
      FormButton: '',
      HasAttachments: false,
      Metadata: [
        {
          Name: 'Deal ID',
          Values: [dealIdentifier],
        },
        {
          Name: 'DestinationMarket',
          Values: [this.generateMultiPartMetadataValue(destinationMarketTermGuid, destinationMarket)],
        },
        {
          Name: 'RiskMarket',
          Values: [this.generateMultiPartMetadataValue(riskMarketTermGuid, riskMarket)],
        },
        {
          Name: 'Exporter/Supplier',
          Values: [this.generateMultiPartMetadataValue(exporterTermGuid, exporterUrl)],
        },
      ],
      TypeGuid: this.custodianConfig.dealTypeGuid,
      SPHostUrl: this.sharepointConfig.scSiteFullUrl,
    };
    await this.custodianService.createAndProvision(createFolderRequest);
  }

  private generateMultiPartMetadataValue(...metadataValueParts: string[]) {
    return metadataValueParts.join('||');
  }
}
