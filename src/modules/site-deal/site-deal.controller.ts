import { Controller, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { CreateFacilityFolderParamsDto } from './dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFacilityFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { SiteDealService } from './site-deal.service';

@Controller('sites/:siteId/deals/:dealId')
export class SiteDealController {
  constructor(private readonly siteDealService: SiteDealService) {}

  @Post('/facilities')
  @ApiOperation({ summary: 'Creates a facility folder for a deal' })
  @ApiCreatedResponse({
    description: 'The name of the folder created.',
    type: CreateFacilityFolderResponseDto,
  })
  @ApiBody({ type: CreateFacilityFolderRequestItem, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async createFacilityFolder(
    @Param() params: CreateFacilityFolderParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityFolderRequestItem }) CreateFacilityFolderRequest: CreateFacilityFolderRequestDto,
  ): Promise<CreateFacilityFolderResponseDto> {
    const [createFacilityFolderRequestItem] = CreateFacilityFolderRequest;

    return await this.siteDealService.createFacilityFolder(params.siteId, params.dealId, createFacilityFolderRequestItem);
  }
}
