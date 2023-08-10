import { CreateTermForFacilityResponseEnum } from '@ukef/constants/enums/create-term-for-facility-response';
import { UkefId } from '@ukef/helpers';
import { CreateFacilityTermRequest } from '@ukef/modules/terms/dto/create-facility-term-request.dto';
import { CreateTermFacilityResponse } from '@ukef/modules/terms/dto/create-facility-term-response.dto';

import { ENVIRONMENT_VARIABLES } from '../environment-variables';
import { AbstractGenerator } from './abstract-generator';
import { RandomValueGenerator } from './random-value-generator';

export class CreateTermFacilityGenerator extends AbstractGenerator<GenerateValues, GenerateResult, GenerateOptions> {
  constructor(protected readonly valueGenerator: RandomValueGenerator) {
    super(valueGenerator);
  }

  protected generateValues(): GenerateValues {
    return {
      id: this.valueGenerator.ukefId(),
    };
  }

  protected transformRawValuesToGeneratedValues(values: GenerateValues[], options: GenerateOptions): GenerateResult {
    const tfisSharepointUrl =
      options.tfisSharepointUrl ??
      `sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_MAIN_SITE_NAME}.sharepoint.com:/sites/${ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_SITE_NAME}:`;
    const tfisFacilityHiddenListTermStoreId =
      options.tfisFacilityHiddenListTermStoreId ?? ENVIRONMENT_VARIABLES.SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID;
    const createTermFacilityRequest: CreateFacilityTermRequest[] = values.map((value) => [
      {
        id: options.id ?? value.id,
      },
    ]);

    const createTermFacilityResponse: CreateTermFacilityResponse[] = values.map(() => ({
      message: CreateTermForFacilityResponseEnum.FACILITY_TERM_CREATED,
    }));

    const graphServicePostParams = values.map((value) => ({
      path: `${tfisSharepointUrl}/lists/${tfisFacilityHiddenListTermStoreId}/items`,
      requestBody: {
        fields: {
          Title: options.id ?? value.id,
        },
      },
    }));

    return {
      createTermFacilityRequest,
      graphServicePostParams,
      createTermFacilityResponse,
    };
  }
}

interface GenerateValues {
  id: UkefId;
}

interface GenerateResult {
  createTermFacilityRequest: CreateFacilityTermRequest[];
  createTermFacilityResponse: CreateTermFacilityResponse[];
  graphServicePostParams;
}

interface GenerateOptions {
  id?: UkefId;
  tfisFacilityHiddenListTermStoreId?: string;
  tfisSharepointUrl?: string;
}
