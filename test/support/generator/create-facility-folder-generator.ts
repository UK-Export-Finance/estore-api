import { UkefId, UkefSiteId } from '@ukef/helpers';
import { CustodianCreateAndProvisionRequest } from '@ukef/modules/custodian/dto/custodian-create-and-provision-request.dto';
import { GraphGetListItemsResponseDto } from '@ukef/modules/graph/dto/graph-get-list-item-response.dto';
import { GraphGetParams } from '@ukef/modules/graph/graph.service';
import { CreateFacilityFolderParamsDto } from '@ukef/modules/site-deal/dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from '@ukef/modules/site-deal/dto/create-facility-folder-request.dto';
import { CreateFacilityFolderResponseDto } from '@ukef/modules/site-deal/dto/create-facility-folder-response.dto';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { graphListItemsGenerator } from './common/graph-list-items-generator';
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
      facilityIdentifier: this.valueGenerator.word(),
      destinationMarket: this.valueGenerator.word(),
      riskMarket: this.valueGenerator.word(),

      facilityTermDataResponseFieldFacilityGUID: this.valueGenerator.string(),

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
      destinationMarket,
      riskMarket,
      facilityTermDataResponseFieldFacilityGUID,
      parentFolderResponseFieldServerRelativeUrl,
      parentFolderResponseFieldCode,
      parentFolderResponseFieldParentCode,
    } = createFacilityFolderValues;

    const siteId = options.siteId ?? createFacilityFolderValues.siteId;
    const dealId = options.dealId ?? createFacilityFolderValues.dealId;

    const facilityFolderName = `F ${facilityIdentifier}`;
    const dealFolderName = `D ${dealId}`;

    const parentFolderResponseFields = {
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
    const sharepointConfigScSharepointUrl = ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME;
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
      destinationMarket: destinationMarket,
      riskMarket: riskMarket,
    };

    const createFacilityFolderRequestDto: CreateFacilityFolderRequestDto = [createFacilityFolderRequestItem];

    const createFacilityFolderResponseDto: CreateFacilityFolderResponseDto = {
      folderName: facilityFolderName,
    };

    const facilityTermDataRequest: GraphGetParams = {
      path: `${sharepointConfigTfisSharepointUrl}:/lists/${sharepointConfigTfisFacilityHiddenListTermStoreId}/items`,
      filter: `fields/Title eq '${facilityIdentifier}' and fields/FacilityGUID ne null`,
      expand: 'fields($select=FacilityGUID,Title)',
    };

    const facilityTermDataResponse: GraphGetListItemsResponseDto = new graphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: facilityTermDataResponseFields,
    });

    const parentFolderRequest: GraphGetParams = {
      path: `${sharepointConfigScSharepointUrl}:/lists/${sharepointConfigTfisFacilityListId}/items`,
      filter: `fields/ServerRelativeUrl eq '/sites/${siteId}/CaseLibrary/${`${buyerName}/D ${dealId}`}'`,
      expand: 'fields($select=Title,ServerRelativeUrl,Code,ID,ParentCode)',
    };

    const parentFolderResponse: GraphGetListItemsResponseDto = new graphListItemsGenerator(this.valueGenerator).generate({
      numberToGenerate: 1,
      graphListItemsFields: parentFolderResponseFields,
    });

    const custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest = {
      Title: facilityFolderName,
      Id: 0,
      Code: '',
      TemplateId: custodianConfigFacilityTemplateId,
      ParentId: parseInt(parentFolderResponse.value[0].fields.id),
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
      SPHostUrl: sharepointConfigScSharepointUrl,
    };

    return {
      createFacilityFolderParamsDto,
      createFacilityFolderRequestItem,
      createFacilityFolderRequestDto,
      createFacilityFolderResponseDto,

      facilityTermDataRequest,
      facilityTermDataResponse,

      parentFolderRequest,
      parentFolderResponse,

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
  destinationMarket: string;
  riskMarket: string;

  facilityTermDataResponseFieldFacilityGUID: string;

  parentFolderResponseFieldServerRelativeUrl: string;
  parentFolderResponseFieldCode: string;
  parentFolderResponseFieldParentCode: string;
}

interface GenerateResult {
  createFacilityFolderParamsDto: CreateFacilityFolderParamsDto;
  createFacilityFolderRequestItem: CreateFacilityFolderRequestItem;
  createFacilityFolderRequestDto: CreateFacilityFolderRequestDto;
  createFacilityFolderResponseDto: CreateFacilityFolderResponseDto;

  facilityTermDataRequest: GraphGetParams;
  facilityTermDataResponse: GraphGetListItemsResponseDto;

  parentFolderRequest: GraphGetParams;
  parentFolderResponse: GraphGetListItemsResponseDto;

  custodianCreateAndProvisionRequest: CustodianCreateAndProvisionRequest;
}

interface GenerateOptions {
  siteId?: UkefSiteId;
  dealId?: UkefId;
}
