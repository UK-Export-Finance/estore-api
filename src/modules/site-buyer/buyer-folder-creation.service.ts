import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';

import { CustodianService } from '../custodian/custodian.service';
import { CustodianCreateAndProvisionRequest } from '../custodian/dto/custodian-create-and-provision-request.dto';
import { FieldEqualsListItemFilter } from '../sharepoint/list-item-filter/field-equals.list-item-filter';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { CreateBuyerFolderRequestItem } from './dto/create-buyer-folder-request.dto';
import { SiteExporterInvalidException } from './exception/site-exporter-invalid.exception';
import { SiteExporterNotFoundException } from './exception/site-exporter-not-found.exception';

type RequiredSharepointConfigKeys = 'scSharepointUrl' | 'scCaseSitesListId' | 'tfisSharepointUrl' | 'tfisCaseSitesListId' | 'scSiteFullUrl';
type RequiredCustodianConfigKeys = 'buyerTemplateId' | 'buyerTypeGuid';

@Injectable()
export class BuyerFolderCreationService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredSharepointConfigKeys>,
    @Inject(CustodianConfig.KEY)
    private readonly custodianConfig: Pick<ConfigType<typeof CustodianConfig>, RequiredCustodianConfigKeys>,
    private readonly sharepointService: SharepointService,
    private readonly custodianService: CustodianService,
  ) {}

  async createBuyerFolder(siteId: string, createBuyerFolderRequestItem: CreateBuyerFolderRequestItem): Promise<string> {
    const { exporterName, buyerName } = createBuyerFolderRequestItem;

    const caseSiteId = await this.getCaseSiteId(siteId);
    const { buyerTermGuid, buyerUrl } = await this.getBuyerTermFromList(siteId, exporterName);

    await this.sendCreateAndProvisionRequestForBuyerFolder(buyerName, caseSiteId, buyerTermGuid, buyerUrl);

    return buyerName;
  }

  private async getCaseSiteId(siteId: string) {
    const searchResults = await this.sharepointService.findListItems<{
      id: string;
      CustodianSiteURL: string;
    }>({
      siteUrl: this.sharepointConfig.scSharepointUrl,
      listId: this.sharepointConfig.scCaseSitesListId,
      fieldsToReturn: ['id', 'CustodianSiteURL'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'CustodianSiteURL', targetValue: siteId }),
    });

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

    const id = parseInt(idString, 10);
    if (isNaN(id)) {
      throw new SiteExporterInvalidException(`The ID for the site found for site ${siteId} is not a number (the value is ${idString}).`);
    }
    return id;
  }

  private async getBuyerTermFromList(siteId: string, exporterName: string) {
    const searchResults = await this.sharepointService.findListItems<{ TermGuid: string; Title: string; URL: string; SiteURL: { Url: string } }>({
      siteUrl: this.sharepointConfig.tfisSharepointUrl,
      listId: this.sharepointConfig.tfisCaseSitesListId,
      fieldsToReturn: ['TermGuid', 'Title', 'URL', 'SiteURL'],
      filter: new FieldEqualsListItemFilter({ fieldName: 'Title', targetValue: exporterName }),
    });

    if (!searchResults.length) {
      throw new SiteExporterNotFoundException(`Did not find the site for exporter ${exporterName} in the tfisCaseSitesList.`);
    }

    const [
      {
        fields: { TermGuid: buyerTermGuid, URL: buyerUrl, SiteURL: siteUrl },
      },
    ] = searchResults;

    if (!buyerTermGuid) {
      throw new SiteExporterInvalidException(`Missing TermGuid for the list item found for exporter ${exporterName} in site ${siteId}.`);
    }
    if (!buyerUrl) {
      throw new SiteExporterInvalidException(`Missing URL for the list item found for exporter ${exporterName} in site ${siteId}.`);
    }
    if (!siteUrl?.Url) {
      throw new SiteExporterInvalidException(`Missing site URL for the list item found for exporter ${exporterName} in site ${siteId}.`);
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
