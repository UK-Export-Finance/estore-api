import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { CustodianService } from '@ukef/modules/custodian/custodian.service';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';

import { CreateBuyerFolderRequestItem } from './dto/create-buyer-folder-request.dto';
import { SiteExporterInvalidException } from './exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from './exception/site-exporter-not-found.exception';

type RequiredCustodianConfigKeys = 'buyerTemplateId' | 'buyerTypeGuid';
type RequiredSharepointConfigKeys = 'scSiteFullUrl';

@Injectable()
export class BuyerFolderCreationService {
  constructor(
    @Inject(CustodianConfig.KEY)
    private readonly custodianConfig: Pick<ConfigType<typeof CustodianConfig>, RequiredCustodianConfigKeys>,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredSharepointConfigKeys>,
    private readonly sharepointService: SharepointService,
    private readonly custodianService: CustodianService,
  ) {}

  async createBuyerFolder(siteId: string, createBuyerFolderRequestItem: CreateBuyerFolderRequestItem): Promise<string> {
    const { buyerName } = createBuyerFolderRequestItem;

    const { caseSiteId } = await this.getCaseSiteId(siteId);
    const { buyerTermGuid, buyerUrl } = await this.getBuyerTermFromList(siteId);

    const existingBuyerFolder = await this.sharepointService.getBuyerFolder({ siteId, buyerName });

    if (existingBuyerFolder.length) {
      // Buyer folder already exists, return 201.
      return buyerName;
    }

    await this.sendCreateAndProvisionRequestForBuyerFolder(buyerName, caseSiteId, buyerTermGuid, buyerUrl);

    return buyerName;
  }

  private async getCaseSiteId(siteId: string) {
    const searchResults = await this.sharepointService.getCaseSite(siteId);

    if (!searchResults.length) {
      throw new SiteExporterNotFoundException(`Did not find the site ${siteId} in the scCaseSitesList.`);
    }

    const [
      {
        fields: { id: idString },
      },
    ] = searchResults;

    if (!idString) {
      throw new SiteExporterInvalidException(`Missing ID for the site found with id ${siteId}.`);
    }

    const caseSiteId = parseInt(idString, 10);
    if (isNaN(caseSiteId)) {
      throw new SiteExporterInvalidException(`The ID for the site found for site ${siteId} is not a number (the value is ${idString}).`);
    }
    return { caseSiteId };
  }

  private async getBuyerTermFromList(siteId: string) {
    const searchResults = await this.sharepointService.getExporterSite(siteId);
    if (!searchResults.length) {
      throw new SiteExporterNotFoundException(`Did not find the site for siteId ${siteId} in the tfisCaseSitesList.`);
    }

    const [
      {
        fields: { TermGuid: buyerTermGuid, URL: buyerUrl, SiteURL: siteUrl },
      },
    ] = searchResults;

    if (!buyerTermGuid) {
      throw new SiteExporterInvalidException(`Missing TermGuid for the list item found for exporter site ${siteId}.`);
    }
    if (!buyerUrl) {
      throw new SiteExporterInvalidException(`Missing URL for the list item found for exporter site ${siteId}.`);
    }
    if (!siteUrl?.Url) {
      throw new SiteExporterInvalidException(`Missing site URL for the list item found for exporter site ${siteId}.`);
    }

    return { buyerTermGuid, buyerUrl };
  }

  private async sendCreateAndProvisionRequestForBuyerFolder(buyerName: string, scListResponseId: number, termGuid: string, termUrl: string): Promise<void> {
    const createFolderRequest: CustodianCreateAndProvisionRequest = {
      Title: buyerName,
      Id: null,
      Code: '',
      TemplateId: this.custodianConfig.buyerTemplateId,
      ParentId: scListResponseId,
      InterestedParties: '',
      Secure: false,
      DoNotSubscribeInterestedParties: false,
      Links: [],
      FormButton: '',
      Metadata: [
        {
          Name: 'Risk Entity',
          Values: [`${termGuid}||${termUrl}`],
        },
        {
          Name: 'Case Description',
          Values: [null],
        },
      ],
      TypeGuid: this.custodianConfig.buyerTypeGuid,
      SPHostUrl: this.sharepointConfig.scSiteFullUrl,
    };
    await this.custodianService.createAndProvision(createFolderRequest);
  }
}
