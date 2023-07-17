import { Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { DealFolderCreationService } from './deal-folder-creation.service';
import { CreateDealFolderParams } from './dto/create-deal-folder-params.dto';
import { CreateDealFolderRequest, CreateDealFolderRequestItem } from './dto/create-deal-folder-request.dto';
import { CreateFacilityFolderParamsDto } from './dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { FacilityFolderCreationService } from './facility-folder-creation.service';
import { FolderDependencyExceptionTransformInterceptor } from './interceptor/folder-dependency-exception-transform.interceptor';
import { SiteDealNotFoundExceptionToBadRequestTransformInterceptor } from './interceptor/site-deal-not-found-exception-to-bad-request-transform.interceptor';

@Controller('sites/:siteId/deals')
export class SiteDealController {
  constructor(
    private readonly facilityFolderCreationService: FacilityFolderCreationService,
    private readonly dealFolderCreationService: DealFolderCreationService,
  ) {}

  @Post('/:dealId/facilities')
  @UseInterceptors(SiteDealNotFoundExceptionToBadRequestTransformInterceptor)
  @ApiOperation({ summary: 'Creates a facility folder for a deal' })
  @ApiCreatedResponse({
    description: 'The creation of the facility folder has been scheduled successfully.',
    type: CreateFolderResponseDto,
  })
  @ApiBody({ type: CreateFacilityFolderRequestItem, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async createFacilityFolder(
    @Param() { siteId, dealId }: CreateFacilityFolderParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityFolderRequestItem }) [createFacilityFolderRequestItem]: CreateFacilityFolderRequestDto,
  ): Promise<CreateFolderResponseDto> {
    return await this.facilityFolderCreationService.createFacilityFolder(siteId, dealId, createFacilityFolderRequestItem);
  }

  @Post()
  @UseInterceptors(FolderDependencyExceptionTransformInterceptor)
  @ApiOperation({ summary: 'Creates a deal folder.' })
  @ApiCreatedResponse({
    description: 'The creation of the deal folder has been scheduled successfully.',
    type: CreateFolderResponseDto,
  })
  @ApiBody({ type: CreateDealFolderRequestItem, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async createDealFolder(
    @Param() { siteId }: CreateDealFolderParams,
    @ValidatedArrayBody({ items: CreateDealFolderRequestItem })
    [{ dealIdentifier, buyerName, exporterName, destinationMarket, riskMarket }]: CreateDealFolderRequest,
  ): Promise<CreateFolderResponseDto> {
    const createdFolderName = await this.dealFolderCreationService.createDealFolder({
      siteId,
      dealIdentifier,
      buyerName,
      exporterName,
      destinationMarket,
      riskMarket,
    });
    return { folderName: createdFolderName };
  }
}
