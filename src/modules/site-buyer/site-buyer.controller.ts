import { Controller, Param, Post, Res, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ENUMS } from '@ukef/constants';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { SharepointService } from '@ukef/modules/sharepoint/sharepoint.service';
import { Response } from 'express';

import { CustodianService } from '../custodian/custodian.service';
import { BuyerFolderCreationService } from './buyer-folder-creation.service';
import { CreateBuyerFolderParamsDto } from './dto/create-buyer-folder-params.dto';
import { CreateBuyerFolderRequestDto, CreateBuyerFolderRequestItem } from './dto/create-buyer-folder-request.dto';
import { CreateBuyerFolderResponseDto } from './dto/create-buyer-folder-response.dto';
import { SiteExporterExceptionTransformInterceptor } from './interceptor/site-exporter-exception-transform.interceptor';

@Controller('sites/:siteId/buyers')
export class SiteBuyerController {
  constructor(
    private readonly buyerFolderCreationService: BuyerFolderCreationService,
    private readonly sharepointService: SharepointService,
    private readonly custodianService: CustodianService,
  ) {}

  @Post()
  @UseInterceptors(SiteExporterExceptionTransformInterceptor)
  @ApiOperation({ summary: 'Creates a buyer folder.' })
  @ApiCreatedResponse({
    description: 'The creation of the buyer folder has been scheduled successfully.',
    type: CreateBuyerFolderResponseDto,
  })
  @ApiBody({ type: CreateBuyerFolderRequestItem, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async createBuyerFolder(
    @Param() { siteId }: CreateBuyerFolderParamsDto,
    @ValidatedArrayBody({ items: CreateBuyerFolderRequestItem }) [{ buyerName }]: CreateBuyerFolderRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CreateBuyerFolderResponseDto> {
    if ((await this.sharepointService.getBuyerFolder({ siteId, buyerName })).length) {
      return this.sharepointService.getFolderInSharepointApiResponse(buyerName, response);
    }
    const { caseSiteId } = await this.buyerFolderCreationService.getCaseSiteId(siteId);
    const folderInCustodianResponse = await this.custodianService.getApiResponseIfFolderInCustodian(caseSiteId, buyerName, response);
    if (folderInCustodianResponse) {
      return folderInCustodianResponse;
    }
    await this.buyerFolderCreationService.createBuyerFolder(siteId, caseSiteId, buyerName);
    return { folderName: buyerName, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN };
  }
}
