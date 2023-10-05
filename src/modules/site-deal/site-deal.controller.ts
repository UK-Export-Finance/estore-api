import { Controller, Param, Post, Res, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ENUMS } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { Response } from 'express';

import { CustodianService } from '../custodian/custodian.service';
import { SharepointService } from '../sharepoint/sharepoint.service';
import { DealFolderCreationService } from './deal-folder-creation.service';
import { CreateDealFolderParams } from './dto/create-deal-folder-params.dto';
import { CreateDealFolderRequest, CreateDealFolderRequestItem } from './dto/create-deal-folder-request.dto';
import { CreateFacilityFolderParamsDto } from './dto/create-facility-folder-params.dto';
import { CreateFacilityFolderRequestDto, CreateFacilityFolderRequestItem } from './dto/create-facility-folder-request.dto';
import { CreateFolderResponseDto } from './dto/create-facility-folder-response.dto';
import { FacilityFolderCreationService } from './facility-folder-creation.service';
import { FolderDependencyExceptionTransformInterceptor } from './interceptor/folder-dependency-exception-transform.interceptor';

@Controller('sites/:siteId/deals')
export class SiteDealController {
  constructor(
    private readonly facilityFolderCreationService: FacilityFolderCreationService,
    private readonly dealFolderCreationService: DealFolderCreationService,
    private readonly sharepointService: SharepointService,
    private readonly custodianService: CustodianService,
  ) {}

  @Post('/:dealId/facilities')
  @UseInterceptors(FolderDependencyExceptionTransformInterceptor)
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<CreateFolderResponseDto> {
    const { facilityIdentifier, buyerName } = createFacilityFolderRequestItem;

    const dealFolderName = this.facilityFolderCreationService.getDealFolderName(buyerName, dealId);
    const folderName = this.facilityFolderCreationService.getFacilityFolderName(facilityIdentifier);
    const dealFolderId = await this.facilityFolderCreationService.getDealFolderId(siteId, dealFolderName);

    if ((await this.sharepointService.getFacilityFolder({ siteId, facilityFolderName: `${dealFolderName}/${folderName}` })).length) {
      return this.sharepointService.getFolderInSharepointApiResponse(folderName, response);
    }

    const folderInCustodianResponse = await this.custodianService.getApiResponseIfFolderInCustodian(dealFolderId, folderName, response);
    if (folderInCustodianResponse) {
      return folderInCustodianResponse;
    }
    await this.facilityFolderCreationService.createFacilityFolder(createFacilityFolderRequestItem, dealFolderId, folderName);
    return { folderName, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN };
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
    [{ dealIdentifier, buyerName, destinationMarket, riskMarket }]: CreateDealFolderRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CreateFolderResponseDto> {
    const folderName = this.dealFolderCreationService.generateDealFolderName(dealIdentifier);
    const buyerFolderId = await this.dealFolderCreationService.getBuyerFolderId({ siteId, buyerName });

    if ((await this.sharepointService.getDealFolder({ siteId, dealFolderName: `${buyerName}/${folderName}` })).length) {
      return this.sharepointService.getFolderInSharepointApiResponse(folderName, response);
    }

    const folderInCustodianResponse = await this.custodianService.getApiResponseIfFolderInCustodian(buyerFolderId, folderName, response);
    if (folderInCustodianResponse) {
      return folderInCustodianResponse;
    }

    await this.dealFolderCreationService.createDealFolder({ siteId, dealIdentifier, destinationMarket, riskMarket, dealFolderName: folderName, buyerFolderId });
    return { folderName, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN };
  }
}
