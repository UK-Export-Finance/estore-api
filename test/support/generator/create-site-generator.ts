import { ENUMS } from '@ukef/constants';
import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { UkefSiteId } from '@ukef/helpers/ukef-id.type';
import { GraphCreateSiteResponseDto } from '@ukef/modules/graph/dto/graph-create-site-response.dto';
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
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const tfisSharepointUrl =
      options.tfisSharepointUrl ?? `sites/${process.env.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${process.env.SHAREPOINT_TFIS_SITE_NAME}`;
    const tfisListId = options.tfisListId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_LIST_ID;
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

    const graphServicePostParams = values.map((value) => ({
      path: `${tfisSharepointUrl}:/lists/${tfisListId}/items`,
      requestBody: {
        fields: {
          Title: options.exporterName ?? value.exporterName,
          URL: value.siteId,
          HomePage: options.exporterName ?? value.exporterName,
          Description: options.exporterName ?? value.exporterName,
        },
      },
    }));

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
      requestToCreateSiteId,
    };
  }
}

interface GenerateValues {
  exporterName: string;
  siteId: UkefSiteId;
}

interface GenerateResult {
  createSiteRequest: CreateSiteRequest;
  graphCreateSiteResponseDto: Partial<GraphCreateSiteResponseDto>[];
  createSiteResponse: CreateSiteResponse[];
  graphServicePostParams;
  requestToCreateSiteId;
}

interface GenerateOptions {
  status?: SiteStatusEnum;
  exporterName?: string;
  tfisSharepointUrl?: string;
  tfisListId?: string;
}
