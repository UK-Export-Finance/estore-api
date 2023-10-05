import { CUSTODIAN, ENUMS } from '@ukef/constants';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { CustodianProvisionJobsByRequestIdRequest } from '@ukef/modules/custodian/dto/custodian-provision-jobs-request.dto';
import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { SharepointGetBuyerFolderParams } from '@ukef/modules/sharepoint/sharepoint.service';
import { CreateBuyerFolderRequestDto, CreateBuyerFolderRequestItem } from '@ukef/modules/site-buyer/dto/create-buyer-folder-request.dto';
import { CreateBuyerFolderResponseDto } from '@ukef/modules/site-buyer/dto/create-buyer-folder-response.dto';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { GraphListItemsGenerator } from './common/graph-list-items-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateBuyerFolderGenerator extends AbstractGenerator<GenerateValues, GenerateResult, unknown> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      siteId: this.valueGenerator.ukefSiteId(),

      buyerName: this.valueGenerator.word(),
      exporterName: this.valueGenerator.word(),

      exporterSiteIdAsNumber: this.valueGenerator.nonnegativeInteger(),
      termGuid: this.valueGenerator.guid(),
      termUrl: this.valueGenerator.httpsUrl(),
      siteUrl: this.valueGenerator.word(),
      custodianRequestId: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], _options: unknown): GenerateResult {
    const [
      {
        siteId,

        buyerName,

        exporterSiteIdAsNumber,
        termGuid,
        termUrl,
        siteUrl,
        custodianRequestId,
      },
    ] = values;

    const custodianCachekey = `${CUSTODIAN.CACHE_KEY_PREFIX}-${exporterSiteIdAsNumber.toString()}-${buyerName}`;

    const exporterSiteIdAsString = exporterSiteIdAsNumber.toString();

    const scCaseSitesListSiteResponseFields: ScCaseSitesListFields = {
      id: exporterSiteIdAsString,
    };
    const tfisCaseSitesListExporterResponseFields: TfisCaseSitesListFields = {
      TermGuid: termGuid,
      URL: termUrl,
      SiteURL: { Url: siteUrl },
    };

    const sharepointConfigTfisSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}`;
    const sharepointConfigScSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigScSiteFullUrl = `https://${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigTfisCaseSitesListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_CASE_SITES_LIST_ID;
    const sharepointConfigTfisDealListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_DEAL_LIST_ID;
    const sharepointConfigScCaseSitesListId = ENVIRONMENT_VARIABLES.SHAREPOINT_SC_CASE_SITES_LIST_ID;

    const createBuyerFolderRequestItem: CreateBuyerFolderRequestItem = {
      buyerName: buyerName,
    };

    const createBuyerFolderRequest: CreateBuyerFolderRequestDto = [createBuyerFolderRequestItem];

    const createBuyerFolderResponse: CreateBuyerFolderResponseDto = {
      folderName: buyerName,
      status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN,
    };

    const createBuyerFolderResponseWhenFolderExistsInSharepoint: CreateBuyerFolderResponseDto = {
      folderName: buyerName,
      status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT,
    };

    const createBuyerFolderResponseWhenFolderCustodianJobStarted: CreateBuyerFolderResponseDto = {
      folderName: buyerName,
      status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED,
    };

    const sharepointServiceGetCaseSiteParams = siteId;
    const sharepointServiceGetExporterSiteParams = siteId;

    const sharepointServiceGetBuyerFolderParams: SharepointGetBuyerFolderParams = {
      siteId,
      buyerName,
    };

    const scCaseSitesListSiteRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigScCaseSitesListId}/items`,
      filter: `fields/CustodianSiteURL eq '${siteId}'`,
      expand: 'fields($select=id,CustodianSiteURL)',
    };

    const tfisCaseSitesListExporterRequest: GraphGetParams = {
      path: `${sharepointConfigTfisSharepointUrl}:/lists/${sharepointConfigTfisCaseSitesListId}/items`,
      filter: `fields/URL eq '${siteId}'`,
      expand: 'fields($select=TermGuid,Title,URL,SiteURL)',
    };

    const tfisBuyerFolderRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigTfisDealListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${buyerName}'`,
      expand: 'fields($select=id)',
    };

    const tfisBuyerFolderResponse = { value: [] };

    const scCaseSitesListSiteResponse = new GraphListItemsGenerator<ScCaseSitesListFields>(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: scCaseSitesListSiteResponseFields,
    });

    const tfisCaseSitesListExporterResponse = new GraphListItemsGenerator<TfisCaseSitesListFields>(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: tfisCaseSitesListExporterResponseFields,
    });

    const custodianCreateAndProvisionRequest = {
      Title: buyerName,
      Id: null,
      Code: '',
      TemplateId: ENVIRONMENT_VARIABLES.CUSTODIAN_BUYER_TEMPLATE_ID,
      ParentId: exporterSiteIdAsNumber,
      InterestedParties: '',
      Secure: false,
      DoNotSubscribeInterestedParties: false,
      Links: [] as [],
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
      TypeGuid: ENVIRONMENT_VARIABLES.CUSTODIAN_BUYER_TYPE_GUID,
      SPHostUrl: sharepointConfigScSiteFullUrl,
    };

    const custodianJobsByRequestIdRequest = {
      RequestId: custodianRequestId,
      SPHostUrl: sharepointConfigScSiteFullUrl,
    };

    return {
      siteId,
      custodianRequestId,
      custodianCachekey,
      createBuyerFolderRequestItem,
      createBuyerFolderRequest,
      createBuyerFolderResponse,
      createBuyerFolderResponseWhenFolderExistsInSharepoint,
      createBuyerFolderResponseWhenFolderCustodianJobStarted,

      sharepointServiceGetCaseSiteParams,
      sharepointServiceGetBuyerFolderParams,
      sharepointServiceGetExporterSiteParams,

      scCaseSitesListSiteRequest,
      scCaseSitesListSiteResponse,

      tfisBuyerFolderRequest,
      tfisBuyerFolderResponse,

      tfisCaseSitesListExporterRequest,
      tfisCaseSitesListExporterResponse,

      custodianCreateAndProvisionRequest,
      custodianJobsByRequestIdRequest,
    };
  }
}

type ScCaseSitesListFields = { id: string };

type TfisCaseSitesListFields = {
  TermGuid: string;
  URL: string;
  SiteURL: {
    Url: string;
  };
};

interface GenerateValues {
  siteId: string;

  exporterName: string;
  buyerName: string;

  exporterSiteIdAsNumber: number;
  termGuid: string;
  termUrl: string;
  siteUrl: string;
  custodianRequestId: string;
}

interface GenerateResult {
  siteId: string;
  custodianRequestId: string;
  custodianCachekey: string;
  createBuyerFolderRequestItem: CreateBuyerFolderRequestItem;
  createBuyerFolderRequest: CreateBuyerFolderRequestDto;
  createBuyerFolderResponse: CreateBuyerFolderResponseDto;
  createBuyerFolderResponseWhenFolderExistsInSharepoint: CreateBuyerFolderResponseDto;
  createBuyerFolderResponseWhenFolderCustodianJobStarted: CreateBuyerFolderResponseDto;

  sharepointServiceGetCaseSiteParams: string;
  sharepointServiceGetBuyerFolderParams: SharepointGetBuyerFolderParams;
  sharepointServiceGetExporterSiteParams: string;

  scCaseSitesListSiteRequest: GraphGetParams;
  scCaseSitesListSiteResponse: GraphGetListItemsResponseDto<ScCaseSitesListFields>;

  tfisCaseSitesListExporterRequest: GraphGetParams;
  tfisCaseSitesListExporterResponse: GraphGetListItemsResponseDto<TfisCaseSitesListFields>;

  tfisBuyerFolderRequest: GraphGetParams;
  tfisBuyerFolderResponse: GraphGetListItemsResponseDto<Array<any>>;

  custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest;
  custodianJobsByRequestIdRequest: CustodianProvisionJobsByRequestIdRequest;
}
