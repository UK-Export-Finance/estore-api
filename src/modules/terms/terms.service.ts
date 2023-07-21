import { Injectable } from '@nestjs/common';
import { ENUMS } from '@ukef/constants';
import { SharepointService } from '../sharepoint/sharepoint.service';

import { CreateTermFacilityResponse } from './dto/create-facility-term-response.dto';
import { TermsFacilityExistsException } from './exception/terms-facility-exists.exception';

@Injectable()
export class TermsService {
  constructor(private readonly sharepointService: SharepointService) {}

  async postFacilityToTermStore(id: string): Promise<CreateTermFacilityResponse> {
    try {
      await this.sharepointService.postFacilityToTermStore(id);
      return { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED };
    } catch (error) {
      if (error instanceof TermsFacilityExistsException) {
        return { message: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS };
      }
      throw error;
    }
  }
}
