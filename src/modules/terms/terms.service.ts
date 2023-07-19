import { Injectable } from '@nestjs/common';
import { ENUMS } from '@ukef/constants';
import { GraphService } from '@ukef/modules/graph/graph.service';

import { CreateTermFacilityResponse } from './dto/create-facility-term-response.dto';
import { TermsFacilityExistsException } from './exception/terms-facility-exists.exception';

@Injectable()
export class TermsService {
  constructor(private readonly graphService: GraphService) {}

  async postFacilityToTermStore(id: string): Promise<CreateTermFacilityResponse> {
    try {
      await this.graphService.postFacilityToTermStore(id);
      return { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED };
    } catch (error) {
      if (error instanceof TermsFacilityExistsException) {
        return { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS };
      }
      throw error;
    }
  }
}
