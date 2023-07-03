import { GraphError } from '@microsoft/microsoft-graph-client';
import { Controller, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ENUMS } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { Response } from 'express';

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
  @ApiOkResponse({
    description: ENUMS.CREATE_TERM_FOR_FACILITY_RESPONSES.FACILITY_TERMS_EXISTS,
    type: CreateTermFacilityResponse,
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
  postFacilityToTermStore(
    @ValidatedArrayBody({ items: CreateFacilityTermRequestItem }) term: CreateFacilityTermRequest,
    @Res() res: Response,
  ): Promise<CreateTermFacilityResponse> {
    try {
      return this.service.postFacilityToTermStore(term[0].id);
    } catch (error) {
      if (error instanceof GraphError) {
        res.status(HttpStatus.OK).json({ message: test });
        return;
      }
    }
    return this.service.postFacilityToTermStore(term[0].id);
  }
}
