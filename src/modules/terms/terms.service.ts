import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { ENUMS } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';

import { CreateTermFacilityResponse } from './dto/create-facility-term-response.dto';
import { TermsFacilityExistsException } from './exception/terms-facility-exists.exception';

type RequiredConfigKeys = 'tfisSharepointUrl' | 'tfisFacilityHiddenListTermStoreId';

@Injectable()
export class TermsService {
  constructor(
    @Inject(SharepointConfig.KEY)
    private readonly config: Pick<ConfigType<typeof SharepointConfig>, RequiredConfigKeys>,
    private readonly graphService: GraphService,
  ) {}

  async postFacilityToTermStore(id: string): Promise<CreateTermFacilityResponse> {
    const requestBody = {
      fields: {
        Title: id,
      },
    };

    const { tfisFacilityHiddenListTermStoreId, tfisSharepointUrl } = this.config;
    try {
      await this.graphService.post<any>({
        path: `${tfisSharepointUrl}/lists/${tfisFacilityHiddenListTermStoreId}/items`,
        requestBody,
      });
      return { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED };
    } catch (error) {
      if (error instanceof TermsFacilityExistsException) {
        return { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS };
      }
      throw error;
    }
  }
}
