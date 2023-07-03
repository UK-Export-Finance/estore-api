import { UkefId, UkefSiteId } from '@ukef/helpers';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { CreateDealFolderRequest, CreateDealFolderRequestItem } from '@ukef/modules/site-deal/dto/create-deal-folder-request.dto';
import { CreateFolderResponseDto } from '@ukef/modules/site-deal/dto/create-facility-folder-response.dto';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { GraphListItemsGenerator } from './common/graph-list-items-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateDealFolderGenerator extends AbstractGenerator<GenerateValues, GenerateResult, unknown> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      siteId: this.valueGenerator.ukefSiteId(),

      dealIdentifier: this.valueGenerator.ukefId(),
      buyerName: this.valueGenerator.word(),
      exporterName: this.valueGenerator.word(),
      destinationMarket: this.valueGenerator.word(),
      riskMarket: this.valueGenerator.word(),

      buyerFolderIdAsNumber: this.valueGenerator.nonnegativeInteger(),
      exporterTermGuid: this.valueGenerator.guid(),
      exporterUrl: this.valueGenerator.httpsUrl(),
      destinationMarketTermGuid: this.valueGenerator.guid(),
      riskMarketTermGuid: this.valueGenerator.guid(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], _options: unknown): GenerateResult {
    const [
      {
        siteId,

        dealIdentifier,
        buyerName,
        exporterName,
        destinationMarket,
        riskMarket,

        buyerFolderIdAsNumber,
        exporterTermGuid,
        exporterUrl,
        destinationMarketTermGuid,
        riskMarketTermGuid,
      },
    ] = values;

    const dealFolderName = `D ${dealIdentifier}`;
    const buyerFolderIdAsString = buyerFolderIdAsNumber.toString();

    const tfisDealListBuyerResponseFields = {
      id: buyerFolderIdAsString,
    };
    const tfisCaseSitesListExporterResponseFields = {
      TermGuid: exporterTermGuid,
      URL: exporterUrl,
    };
    const taxonomyTermStoreListDestinationMarketResponseFields = {
      TermGuid: destinationMarketTermGuid,
    };
    const taxonomyTermStoreListRiskMarketResponseFields = {
      TermGuid: riskMarketTermGuid,
    };

    const sharepointConfigTfisSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}`;
    const sharepointConfigScSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigScSiteFullUrl = `https://${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigTfisDealListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_DEAL_LIST_ID;
    const sharepointConfigTfisCaseSitesListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_CASE_SITES_LIST_ID;
    const sharepointConfigTaxonomyTermStoreListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TAXONOMY_HIDDEN_LIST_TERM_STORE_LIST_ID;

    const createDealFolderRequestItem: CreateDealFolderRequestItem = {
      dealIdentifier,
      exporterName: exporterName,
      buyerName: buyerName,
      destinationMarket: destinationMarket,
      riskMarket: riskMarket,
    };

    const createDealFolderRequest: CreateDealFolderRequest = [createDealFolderRequestItem];

    const createDealFolderResponse: CreateFolderResponseDto = {
      folderName: dealFolderName,
    };

    const tfisDealListBuyerRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigTfisDealListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${buyerName}'`,
      expand: 'fields($select=id)',
    };

    const tfisCaseSitesListExporterRequest: GraphGetParams = {
      path: `${sharepointConfigTfisSharepointUrl}:/lists/${sharepointConfigTfisCaseSitesListId}/items`,
      filter: `fields/Title eq '${exporterName}'`,
      expand: 'fields($select=TermGuid,URL)',
    };

    const taxonomyHiddenListTermStoreDestinationMarketRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigTaxonomyTermStoreListId}/items`,
      filter: `fields/Title eq '${destinationMarket}'`,
      expand: 'fields($select=TermGuid)',
    };

    const taxonomyHiddenListTermStoreRiskMarketRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigTaxonomyTermStoreListId}/items`,
      filter: `fields/Title eq '${riskMarket}'`,
      expand: 'fields($select=TermGuid)',
    };

    const tfisDealListBuyerResponse: GraphGetListItemsResponseDto = new GraphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: tfisDealListBuyerResponseFields,
    });

    const tfisCaseSitesListExporterResponse: GraphGetListItemsResponseDto = new GraphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: tfisCaseSitesListExporterResponseFields,
    });

    const taxonomyHiddenListTermStoreDestinationMarketResponse: GraphGetListItemsResponseDto = new GraphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: taxonomyTermStoreListDestinationMarketResponseFields,
    });

    const taxonomyHiddenListTermStoreRiskMarketResponse: GraphGetListItemsResponseDto = new GraphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: taxonomyTermStoreListRiskMarketResponseFields,
    });

    const custodianCreateAndProvisionRequest = {
      Title: dealFolderName,
      Id: 0,
      Code: '',
      TemplateId: ENVIRONMENT_VARIABLES.CUSTODIAN_DEAL_TEMPLATE_ID,
      ParentId: buyerFolderIdAsNumber,
      InterestedParties: '',
      Secure: false,
      DoNotSubscribeInterestedParties: false,
      Links: [] as [],
      FormButton: '',
      HasAttachments: false,
      Metadata: [
        {
          Name: 'Deal ID',
          Values: [dealIdentifier],
        },
        {
          Name: 'DestinationMarket',
          Values: [`${destinationMarketTermGuid}||${destinationMarket}`],
        },
        {
          Name: 'RiskMarket',
          Values: [`${riskMarketTermGuid}||${riskMarket}`],
        },
        {
          Name: 'Exporter/Supplier',
          Values: [`${exporterTermGuid}||${exporterUrl}`],
        },
      ],
      TypeGuid: ENVIRONMENT_VARIABLES.CUSTODIAN_DEAL_TYPE_GUID,
      SPHostUrl: sharepointConfigScSiteFullUrl,
    };

    return {
      siteId,
      createDealFolderRequestItem,
      createDealFolderRequest,
      createDealFolderResponse,

      tfisDealListBuyerRequest,
      tfisDealListBuyerResponse,

      tfisCaseSitesListExporterRequest,
      tfisCaseSitesListExporterResponse,

      taxonomyHiddenListTermStoreDestinationMarketRequest,
      taxonomyHiddenListTermStoreDestinationMarketResponse,

      taxonomyHiddenListTermStoreRiskMarketRequest,
      taxonomyHiddenListTermStoreRiskMarketResponse,

      custodianCreateAndProvisionRequest,
    };
  }
}

interface GenerateValues {
  siteId: UkefSiteId;

  dealIdentifier: UkefId;
  exporterName: string;
  buyerName: string;
  destinationMarket: string;
  riskMarket: string;

  buyerFolderIdAsNumber: number;
  exporterTermGuid: string;
  exporterUrl: string;
  destinationMarketTermGuid: string;
  riskMarketTermGuid: string;
}

interface GenerateResult {
  siteId: UkefSiteId;
  createDealFolderRequestItem: CreateDealFolderRequestItem;
  createDealFolderRequest: CreateDealFolderRequest;
  createDealFolderResponse: CreateFolderResponseDto;

  tfisDealListBuyerRequest: GraphGetParams;
  tfisDealListBuyerResponse: GraphGetListItemsResponseDto;

  tfisCaseSitesListExporterRequest: GraphGetParams;
  tfisCaseSitesListExporterResponse: GraphGetListItemsResponseDto;

  taxonomyHiddenListTermStoreDestinationMarketRequest: GraphGetParams;
  taxonomyHiddenListTermStoreDestinationMarketResponse: GraphGetListItemsResponseDto;

  taxonomyHiddenListTermStoreRiskMarketRequest: GraphGetParams;
  taxonomyHiddenListTermStoreRiskMarketResponse: GraphGetListItemsResponseDto;

  custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest;
}
