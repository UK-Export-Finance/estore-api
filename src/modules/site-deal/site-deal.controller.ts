import { BadRequestException, Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { DealFolderService } from './deal-folder.service';
import { CreateDealFolderParams } from './dto/create-deal-folder-params.dto';
import { CreateDealFolderRequest, CreateDealFolderRequestItem } from './dto/create-deal-folder-request.dto';
import { CreateFacilityFolderParamsDto } from './dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { FolderDependencyNotFoundException } from './exception/folder-dependency-not-found.exception';
import { SiteDealService } from './site-deal.service';
import { SiteDealNotFoundExceptionToBadRequestTransformInterceptor } from './site-deal-not-found-exception-to-bad-request-transform.interceptor';

@Controller('sites/:siteId/deals')
export class SiteDealController {
  constructor(private readonly siteDealService: SiteDealService, private readonly dealFolderService: DealFolderService) {}

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
    @Param() params: CreateFacilityFolderParamsDto,
    @ValidatedArrayBody({ items: CreateFacilityFolderRequestItem }) CreateFacilityFolderRequest: CreateFacilityFolderRequestDto,
  ): Promise<CreateFolderResponseDto> {
    const [createFacilityFolderRequestItem] = CreateFacilityFolderRequest;

    return await this.siteDealService.createFacilityFolder(params.siteId, params.dealId, createFacilityFolderRequestItem);
  }

  @Post()
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
    try {
      const createdFolderName = await this.dealFolderService.createDealFolder({
        siteId,
        dealIdentifier,
        buyerName,
        exporterName,
        destinationMarket,
        riskMarket,
      });
      return { folderName: createdFolderName };
    } catch (error) {
      // TODO APIM-136: Should we have an explanatory error message for FolderDependencyInvalidException?
      if (error instanceof FolderDependencyNotFoundException) {
        throw new BadRequestException(error.message, { cause: error });
      }
      throw error;
    }
  }
}
