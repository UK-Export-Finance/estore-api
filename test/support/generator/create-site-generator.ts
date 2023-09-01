import { ENUMS } from '@ukef/constants';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { DateString } from '@ukef/helpers/date-string.type';
import { GraphCreateSiteResponseDto } from '@ukef/modules/graph/dto/graph-create-site-response.dto';
import { MdmCreateNumbersRequest } from '@ukef/modules/mdm/dto/mdm-create-numbers-request.dto';
import { MdmCreateNumbersResponse } from '@ukef/modules/mdm/dto/mdm-create-numbers-response.dto';
import { SharepointCreateSiteParams } from '@ukef/modules/sharepoint/sharepoint.service';
import { CreateSiteRequest } from '@ukef/modules/site/dto/create-site-request.dto';
import { CreateSiteResponse } from '@ukef/modules/site/dto/create-site-response.dto';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';

import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateSiteGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      exporterName: this.valueGenerator.exporterName(),
      siteId: this.valueGenerator.ukefSiteId(),
      dbId: this.valueGenerator.integer(),
      nowDate: this.valueGenerator.dateTimeString(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const tfisSharepointUrl =
      options.tfisSharepointUrl ??
      `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}:`;
    const tfisCaseSitesListId = options.tfisCaseSitesListId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_CASE_SITES_LIST_ID;
    const status = options.status ?? ENUMS.SITE_STATUSES.PROVISIONING;
    const createSiteRequest: CreateSiteRequest = values.map((value) => ({
      exporterName: options.exporterName ?? value.exporterName,
    }));

    const graphCreateSiteResponseDto = values.map((value) => ({
      fields: {
        Title: options.exporterName ?? value.exporterName,
        Sitestatus: status,
        URL: value.siteId,
      },
    }));

    const createSiteResponse: CreateSiteResponse[] = values.map((value) => ({
      siteId: value.siteId,
      status: status,
    }));

    const sharepointServiceCreateSiteParams: SharepointCreateSiteParams[] = values.map((value) => ({
      exporterName: options.exporterName ?? value.exporterName,
      newSiteId: value.siteId,
    }));

    const graphServicePostParams = values.map((value) => ({
      path: `${tfisSharepointUrl}/lists/${tfisCaseSitesListId}/items`,
      requestBody: {
        fields: {
          Title: options.exporterName ?? value.exporterName,
          URL: value.siteId,
          HomePage: options.exporterName ?? value.exporterName,
          Description: options.exporterName ?? value.exporterName,
        },
      },
    }));

    const mdmCreateNumbersRequest: MdmCreateNumbersRequest = [
      {
        numberTypeId: 6,
        createdBy: 'Estore',
        requestingSystem: 'Estore',
      },
    ];
    const mdmCreateNumbersResponse: MdmCreateNumbersResponse[] = values.map((value) => {
      return [
        {
          id: value.dbId,
          maskedId: value.siteId,
          type: 6,
          createdBy: 'Estore',
          createdDatetime: value.nowDate,
          requestingSystem: 'Estore',
        },
      ];
    });

    const applicationNameToCreateSiteIdWith = 'Estore';
    const requestToCreateSiteId = [
      {
        numberTypeId: 6,
        createdBy: applicationNameToCreateSiteIdWith,
        requestingSystem: applicationNameToCreateSiteIdWith,
      },
    ];

    return {
      createSiteRequest,
      graphServicePostParams,
      graphCreateSiteResponseDto,
      createSiteResponse,
      sharepointServiceCreateSiteParams,
      mdmCreateNumbersRequest,
      mdmCreateNumbersResponse,
      requestToCreateSiteId,
    };
  }
}

interface GenerateValues {
  exporterName: string;
  siteId: string;
  dbId: number;
  nowDate: DateString;
}

interface GenerateResult {
  createSiteRequest: CreateSiteRequest;
  graphCreateSiteResponseDto: Partial<GraphCreateSiteResponseDto>[];
  createSiteResponse: CreateSiteResponse[];
  sharepointServiceCreateSiteParams: SharepointCreateSiteParams[];
  mdmCreateNumbersRequest: MdmCreateNumbersRequest;
  mdmCreateNumbersResponse: MdmCreateNumbersResponse[];
  graphServicePostParams;
  requestToCreateSiteId;
}

interface GenerateOptions {
  status?: SiteStatusEnum;
  exporterName?: string;
  tfisSharepointUrl?: string;
  tfisCaseSitesListId?: string;
}
