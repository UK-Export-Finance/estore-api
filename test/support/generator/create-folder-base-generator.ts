import { CUSTODIAN, ENUMS } from '@ukef/constants';
import { CustodianProvisionJobsByRequestIdRequest } from '@ukef/modules/custodian/dto/custodian-provision-jobs-request.dto';
import { CreateBuyerFolderResponseDto } from '@ukef/modules/site-buyer/dto/create-buyer-folder-response.dto';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateFolderBaseGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      custodianRequestId: this.valueGenerator.string(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], _options: GenerateOptions): GenerateResult {
    const [{ custodianRequestId }] = values;

    const custodianCachekey = `${CUSTODIAN.CACHE_KEY_PREFIX}-${_options.parentFolderId.toString()}-${_options.folderName}`;
    const sharepointConfigScSiteFullUrl = `https://${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_SC_SITE_NAME}`;

    const createFolderResponse: CreateBuyerFolderResponseDto = {
      folderName: _options.folderName,
      status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN,
    };

    const createFolderResponseWhenFolderExistsInSharepoint: CreateBuyerFolderResponseDto = {
      folderName: _options.folderName,
      status: ENUMS.FOLDER_STATUSES.EXISTS_IN_SHAREPOINT,
    };

    const createFolderResponseWhenFolderCustodianJobStarted: CreateBuyerFolderResponseDto = {
      folderName: _options.folderName,
      status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED,
    };

    const custodianJobsByRequestIdRequest = {
      RequestId: custodianRequestId,
      SPHostUrl: sharepointConfigScSiteFullUrl,
    };

    return {
      custodianRequestId,
      custodianCachekey,
      createFolderResponse,
      createFolderResponseWhenFolderExistsInSharepoint,
      createFolderResponseWhenFolderCustodianJobStarted,

      custodianJobsByRequestIdRequest,
    };
  }
}

interface GenerateValues {
  custodianRequestId: string;
}

interface GenerateResult {
  custodianRequestId: string;
  custodianCachekey: string;
  createFolderResponse: CreateBuyerFolderResponseDto;
  createFolderResponseWhenFolderExistsInSharepoint: CreateBuyerFolderResponseDto;
  createFolderResponseWhenFolderCustodianJobStarted: CreateBuyerFolderResponseDto;

  custodianJobsByRequestIdRequest: CustodianProvisionJobsByRequestIdRequest;
}

interface GenerateOptions {
  parentFolderId: number;
  folderName: string;
}
