import { UkefId, UkefSiteId } from '@ukef/helpers';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { CreateFacilityFolderParamsDto } from '@ukef/modules/site-deal/dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from '@ukef/modules/site-deal/dto/create-facility-folder-request.dto';
import { CreateFolderResponseDto } from '@ukef/modules/site-deal/dto/create-facility-folder-response.dto';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { GraphListItemsGenerator } from './common/graph-list-items-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFacilityFolderGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      siteId: this.valueGenerator.ukefSiteId(),
      dealId: this.valueGenerator.ukefId(),

      exporterName: this.valueGenerator.word(),
      buyerName: this.valueGenerator.word(),
      facilityIdentifier: this.valueGenerator.facilityId(),

      facilityTermDataResponseFieldFacilityGUID: this.valueGenerator.string({ length: 36 }),

      parentFolderResponseFieldServerRelativeUrl: this.valueGenerator.string(),
      parentFolderResponseFieldCode: this.valueGenerator.stringOfNumericCharacters(),
      parentFolderResponseFieldParentCode: this.valueGenerator.stringOfNumericCharacters(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const [createFacilityFolderValues] = values;
    const {
      exporterName,
      buyerName,
      facilityIdentifier,
      facilityTermDataResponseFieldFacilityGUID,
      parentFolderResponseFieldServerRelativeUrl,
      parentFolderResponseFieldCode,
      parentFolderResponseFieldParentCode,
    } = createFacilityFolderValues;

    const siteId = options.siteId ?? createFacilityFolderValues.siteId;
    const dealId = options.dealId ?? createFacilityFolderValues.dealId;

    const facilityFolderName = `F ${facilityIdentifier}`;
    const dealFolderName = `D ${dealId}`;

    const tfisFacilityListParentFolderResponseFields = {
      Title: dealFolderName,
      ServerRelativeUrl: parentFolderResponseFieldServerRelativeUrl,
      Code: parentFolderResponseFieldCode,
      ParentCode: parentFolderResponseFieldParentCode,
    };

    const facilityTermDataResponseFields = {
      Title: facilityIdentifier,
      FacilityGUID: facilityTermDataResponseFieldFacilityGUID,
    };

    const custodianConfigFacilityTemplateId = ENVIRONMENT_VARIABLES.CUSTODIAN_FACILITY_TEMPLATE_ID;
    const custodianConfigFacilityTypeGuid = ENVIRONMENT_VARIABLES.CUSTODIAN_FACILITY_TYPE_GUID;
    const sharepointConfigTfisSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}`;
    const sharepointConfigScSharepointUrl = `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigScSiteFullUrl = `https://${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;
    const sharepointConfigTfisFacilityHiddenListTermStoreId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID;
    const sharepointConfigTfisFacilityListId = ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_FACILITY_LIST_ID;

    const createFacilityFolderParamsDto: CreateFacilityFolderParamsDto = {
      siteId,
      dealId,
    };

    const createFacilityFolderRequestItem: CreateFacilityFolderRequestItem = {
      exporterName: exporterName,
      buyerName: buyerName,
      facilityIdentifier: facilityIdentifier,
    };

    const createFacilityFolderRequestDto: CreateFacilityFolderRequestDto = [createFacilityFolderRequestItem];

    const createFacilityFolderResponseDto: CreateFolderResponseDto = {
      folderName: facilityFolderName,
    };

    const tfisFacilityHiddenListTermStoreFacilityTermDataRequest: GraphGetParams = {
      path: `${sharepointConfigTfisSharepointUrl}:/lists/${sharepointConfigTfisFacilityHiddenListTermStoreId}/items`,
      filter: `fields/Title eq '${facilityIdentifier}' and fields/FacilityGUID ne null`,
      expand: 'fields($select=FacilityGUID,Title)',
    };

    const tfisFacilityHiddenListTermStoreFacilityTermDataResponse: GraphGetListItemsResponseDto = new GraphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: facilityTermDataResponseFields,
    });

    const tfisFacilityListParentFolderRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigTfisFacilityListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${`${buyerName}/D ${dealId}`}'`,
      expand: 'fields($select=Title,ServerRelativeUrl,Code,ID,ParentCode)',
    };

    const tfisFacilityListParentFolderResponse: GraphGetListItemsResponseDto = new GraphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: tfisFacilityListParentFolderResponseFields,
    });

    const custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest = {
      Title: facilityFolderName,
      Id: 0,
      Code: '',
      TemplateId: custodianConfigFacilityTemplateId,
      ParentId: parseInt(tfisFacilityListParentFolderResponse.value[0].fields.id),
      InterestedParties: '',
      Secure: false,
      DoNotSubscribeInterestedParties: false,
      Links: [],
      FormButton: '',
      HasAttachments: false,
      Metadata: [
        {
          Name: 'Facility ID',
          Values: [`${facilityTermDataResponseFieldFacilityGUID}||${facilityIdentifier}`],
        },
      ],
      TypeGuid: custodianConfigFacilityTypeGuid,
      SPHostUrl: sharepointConfigScSiteFullUrl,
    };

    return {
      createFacilityFolderParamsDto,
      createFacilityFolderRequestItem,

      createFacilityFolderRequestDto,
      createFacilityFolderResponseDto,

      tfisFacilityHiddenListTermStoreFacilityTermDataRequest,
      tfisFacilityHiddenListTermStoreFacilityTermDataResponse,

      tfisFacilityListParentFolderRequest,
      tfisFacilityListParentFolderResponse,

      custodianCreateAndProvisionRequest,
    };
  }
}

interface GenerateValues {
  siteId: UkefSiteId;
  dealId: UkefId;

  exporterName: string;
  buyerName: string;
  facilityIdentifier: string;

  facilityTermDataResponseFieldFacilityGUID: string;

  parentFolderResponseFieldServerRelativeUrl: string;
  parentFolderResponseFieldCode: string;
  parentFolderResponseFieldParentCode: string;
}

interface GenerateResult {
  createFacilityFolderParamsDto: CreateFacilityFolderParamsDto;
  createFacilityFolderRequestItem: CreateFacilityFolderRequestItem;

  createFacilityFolderRequestDto: CreateFacilityFolderRequestDto;
  createFacilityFolderResponseDto: CreateFolderResponseDto;

  tfisFacilityHiddenListTermStoreFacilityTermDataRequest: GraphGetParams;
  tfisFacilityHiddenListTermStoreFacilityTermDataResponse: GraphGetListItemsResponseDto;

  tfisFacilityListParentFolderRequest: GraphGetParams;
  tfisFacilityListParentFolderResponse: GraphGetListItemsResponseDto;

  custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest;
}

interface GenerateOptions {
  siteId?: UkefSiteId;
  dealId?: UkefId;
}
