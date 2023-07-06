import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { CreateBuyerFolderParamsDto } from './dto/create-buyer-folder-params.dto';
import { CreateBuyerFolderRequestDto, CreateBuyerFolderRequestItem } from './dto/create-buyer-folder-request.dto';
import { CreateBuyerFolderResponseDto } from './dto/create-buyer-folder-response.dto';
import { SiteExporterNotFoundException } from './exception/site-exporter-not-found.exception';
import { SiteBuyerService } from './site-buyer.service';

@Controller('sites/:siteId/buyers')
export class SiteBuyerController {
  constructor(private readonly buyerFolderService: SiteBuyerService) {}

  @Post()
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
    @ValidatedArrayBody({ items: CreateBuyerFolderRequestItem }) createBuyerFolderRequest: CreateBuyerFolderRequestDto,
  ): Promise<CreateBuyerFolderResponseDto> {
    const [createFacilityFolderRequestItem] = createBuyerFolderRequest;
    try {
      const buyerName = await this.buyerFolderService.createBuyerFolder(siteId, createFacilityFolderRequestItem);
      return { buyerName: buyerName };
    } catch (error) {
      if (error instanceof SiteExporterNotFoundException) {
        throw new BadRequestException(error.message, { cause: error });
      }
      throw error;
    }
  }
}
