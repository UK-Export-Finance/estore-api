import { Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { BuyerFolderCreationService } from './buyer-folder-creation.service';
import { CreateBuyerFolderParamsDto } from './dto/create-buyer-folder-params.dto';
import { CreateBuyerFolderRequestDto, CreateBuyerFolderRequestItem } from './dto/create-buyer-folder-request.dto';
import { CreateBuyerFolderResponseDto } from './dto/create-buyer-folder-response.dto';
import { SiteExporterExceptionTransformInterceptor } from './interceptor/site-exporter-exception-transform.interceptor';

@Controller('sites/:siteId/buyers')
export class SiteBuyerController {
  constructor(private readonly buyerFolderCreationService: BuyerFolderCreationService) {}

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
    @ValidatedArrayBody({ items: CreateBuyerFolderRequestItem }) [createBuyerFolderRequestItem]: CreateBuyerFolderRequestDto,
  ): Promise<CreateBuyerFolderResponseDto> {
    const buyerName = await this.buyerFolderCreationService.createBuyerFolder(siteId, createBuyerFolderRequestItem);
    return { buyerName: buyerName };
  }
}
