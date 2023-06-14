import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { RESPONSE } from '@ukef/constants';

import { CreateFacilityTermRequestItem } from './dto/create-facility-term-request.dto';
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
  })
  @ApiCreatedResponse({
    description: RESPONSE.FACILITY_TERM_CREATED,
    type: CreateFacilityTermRequestItem,
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
  postFacilityToTermStore(@Body() term: CreateFacilityTermRequestItem): Promise<CreateFacilityTermRequestItem> {
    return this.service.postFacilityToTermStore(term.id);
  }
}
