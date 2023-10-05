import { CUSTODIAN, ENUMS } from '@ukef/constants';
import { UkefId } from '@ukef/helpers';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { CustodianProvisionJobsByRequestIdRequest } from '@ukef/modules/custodian/dto/custodian-provision-jobs-request.dto';
import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { SharepointGetBuyerFolderParams, SharepointGetDealFolderParams } from '@ukef/modules/sharepoint/sharepoint.service';
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
      custodianRequestId: this.valueGenerator.string(),
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
        custodianRequestId,
      },
    ] = values;

    const dealFolderName = `D ${dealIdentifier}`;

    const custodianCachekey = `${CUSTODIAN.CACHE_KEY_PREFIX}-${buyerFolderIdAsNumber.toString()}-${dealFolderName}`;

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

    const sharepointConfigTfisSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}:`;
    const sharepointConfigScSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}:`;
    const sharepointConfigScSiteFullUrl = `https://${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigTfisDealListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_DEAL_LIST_ID;
    const sharepointConfigTfisFacilityListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_FACILITY_LIST_ID;
    const sharepointConfigTfisCaseSitesListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_CASE_SITES_LIST_ID;
    const sharepointConfigTaxonomyTermStoreListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TAXONOMY_HIDDEN_LIST_TERM_STORE_LIST_ID;

    const createDealFolderRequestItem: CreateDealFolderRequestItem = {
      dealIdentifier,
      buyerName: buyerName,
      destinationMarket: destinationMarket,
      riskMarket: riskMarket,
    };

    const createDealFolderRequest: CreateDealFolderRequest = [createDealFolderRequestItem];

    const createDealFolderResponse: CreateFolderResponseDto = {
      folderName: dealFolderName,
      status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN,
    };

    const sharepointServiceGetBuyerDealFolderParams: SharepointGetBuyerFolderParams = {
      siteId,
      buyerName,
    };
    const sharepointServiceGetExporterSiteParams = siteId;
    const sharepointServiceGetDealFolderParams: SharepointGetDealFolderParams = {
      siteId,
      dealFolderName: `${buyerName}/${dealFolderName}`,
    };

    const sharepointServiceGetDestinationMarketParams = destinationMarket;
    const sharepointServiceGetRiskMarketParams = riskMarket;

    const tfisDealListBuyerRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}/lists/${sharepointConfigTfisDealListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${buyerName}'`,
      expand: 'fields($select=id)',
    };

    const tfisCaseSitesListExporterRequest: GraphGetParams = {
      path: `${sharepointConfigTfisSharepointUrl}/lists/${sharepointConfigTfisCaseSitesListId}/items`,
      filter: `fields/Title eq '${exporterName}'`,
      expand: 'fields($select=TermGuid,URL)',
    };

    const tfisGetDealFolderRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}/lists/${sharepointConfigTfisFacilityListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${dealFolderName}'`,
      expand: 'fields($select=Title,ServerRelativeUrl,Code,id,ParentCode)',
    };

    const tfisGetDealFolderResponse = { value: [] };

    const createDealFolderResponseWhenFolderExistsInSharepoint: CreateFolderResponseDto = {
      folderName: dealFolderName,
      status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT,
    };

    const createDealFolderResponseWhenFolderCustodianJobStarted: CreateFolderResponseDto = {
      folderName: dealFolderName,
      status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED,
    };

    const taxonomyHiddenListTermStoreDestinationMarketRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}/lists/${sharepointConfigTaxonomyTermStoreListId}/items`,
      filter: `fields/Title eq '${destinationMarket}'`,
      expand: 'fields($select=TermGuid)',
    };

    const taxonomyHiddenListTermStoreRiskMarketRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}/lists/${sharepointConfigTaxonomyTermStoreListId}/items`,
      filter: `fields/Title eq '${riskMarket}'`,
      expand: 'fields($select=TermGuid)',
    };

    const tfisDealListBuyerResponse = new GraphListItemsGenerator<TfisDealListFields>(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: tfisDealListBuyerResponseFields,
    });

    const tfisCaseSitesListExporterResponse = new GraphListItemsGenerator<TfisCaseSitesListFields>(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: tfisCaseSitesListExporterResponseFields,
    });

    const taxonomyHiddenListTermStoreDestinationMarketResponse = new GraphListItemsGenerator<TaxonomyHiddenListTermStoreFields>(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: taxonomyTermStoreListDestinationMarketResponseFields,
    });

    const taxonomyHiddenListTermStoreRiskMarketResponse = new GraphListItemsGenerator<TaxonomyHiddenListTermStoreFields>(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: taxonomyTermStoreListRiskMarketResponseFields,
    });

    const custodianJobsByRequestIdRequest = {
      RequestId: custodianRequestId,
      SPHostUrl: sharepointConfigScSiteFullUrl,
    };

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
      custodianRequestId,
      custodianCachekey,
      createDealFolderRequestItem,
      createDealFolderRequest,
      createDealFolderResponse,
      createDealFolderResponseWhenFolderExistsInSharepoint,
      createDealFolderResponseWhenFolderCustodianJobStarted,

      sharepointServiceGetBuyerDealFolderParams,
      sharepointServiceGetDealFolderParams,
      sharepointServiceGetExporterSiteParams,
      sharepointServiceGetDestinationMarketParams,
      sharepointServiceGetRiskMarketParams,

      tfisDealListBuyerRequest,
      tfisDealListBuyerResponse,

      tfisCaseSitesListExporterRequest,
      tfisCaseSitesListExporterResponse,

      tfisGetDealFolderRequest,
      tfisGetDealFolderResponse,

      taxonomyHiddenListTermStoreDestinationMarketRequest,
      taxonomyHiddenListTermStoreDestinationMarketResponse,

      taxonomyHiddenListTermStoreRiskMarketRequest,
      taxonomyHiddenListTermStoreRiskMarketResponse,

      custodianCreateAndProvisionRequest,
      custodianJobsByRequestIdRequest,
    };
  }
}

type TfisDealListFields = { id: string };
type TfisCaseSitesListFields = { TermGuid: string; URL: string };
type TaxonomyHiddenListTermStoreFields = { TermGuid: string };

interface GenerateValues {
  siteId: string;

  custodianRequestId: string;

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
  siteId: string;
  custodianRequestId: string;
  custodianCachekey: string;
  createDealFolderRequestItem: CreateDealFolderRequestItem;
  createDealFolderRequest: CreateDealFolderRequest;
  createDealFolderResponse: CreateFolderResponseDto;
  createDealFolderResponseWhenFolderExistsInSharepoint: CreateFolderResponseDto;
  createDealFolderResponseWhenFolderCustodianJobStarted: CreateFolderResponseDto;

  sharepointServiceGetBuyerDealFolderParams: SharepointGetBuyerFolderParams;
  sharepointServiceGetDealFolderParams: SharepointGetDealFolderParams;
  sharepointServiceGetExporterSiteParams: string;
  sharepointServiceGetDestinationMarketParams: string;
  sharepointServiceGetRiskMarketParams: string;

  tfisDealListBuyerRequest: GraphGetParams;
  tfisDealListBuyerResponse: GraphGetListItemsResponseDto<TfisDealListFields>;

  tfisCaseSitesListExporterRequest: GraphGetParams;
  tfisCaseSitesListExporterResponse: GraphGetListItemsResponseDto<TfisCaseSitesListFields>;

  tfisGetDealFolderRequest: GraphGetParams;
  tfisGetDealFolderResponse: GraphGetListItemsResponseDto<Array<any>>;

  taxonomyHiddenListTermStoreDestinationMarketRequest: GraphGetParams;
  taxonomyHiddenListTermStoreDestinationMarketResponse: GraphGetListItemsResponseDto<TaxonomyHiddenListTermStoreFields>;

  taxonomyHiddenListTermStoreRiskMarketRequest: GraphGetParams;
  taxonomyHiddenListTermStoreRiskMarketResponse: GraphGetListItemsResponseDto<TaxonomyHiddenListTermStoreFields>;

  custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest;
  custodianJobsByRequestIdRequest: CustodianProvisionJobsByRequestIdRequest;
}
