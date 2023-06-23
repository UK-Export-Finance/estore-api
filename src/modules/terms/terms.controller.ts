import { Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ENUMS } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { CreateFacilityTermRequest, CreateFacilityTermRequestItem } from './dto/create-facility-term-request.dto';
import { CreateTermFacilityResponse } from './dto/create-facility-term-response.dto';
import { TermsService } from './terms.service';

@Controller('terms')
export class TermsController {
  constructor(private readonly service: TermsService) {}

  @Post('facilities')
  @ApiOperation({
    summary: 'Add a new facility ID to term store.',
  })
  @ApiBody({
    type: CreateFacilityTermRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({
    description: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERM_CREATED,
    type: CreateTermFacilityResponse,
  })
  @ApiNotFoundResponse({
    description: 'The facility ID was not found.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request.',
  })
  @ApiInternalServerErrorResponse({
    description: 'An internal server error has occurred.',
  })
  postFacilityToTermStore(@ValidatedArrayBody({ items: CreateFacilityTermRequestItem }) term: CreateFacilityTermRequest): Promise<CreateTermFacilityResponse> {
    return this.service.postFacilityToTermStore(term[0].id);
  }
}
