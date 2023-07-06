import { Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { DtfsStorageExceptionTransformInterceptor } from '../dtfs-storage/dtfs-storage-exception-transform.interceptor';
import { DealFolderService } from './deal-folder.service';
import { UploadFileInDealFolderParamsDto } from './dto/upload-file-in-deal-folder-params.dto';
import { UploadFileInDealFolderRequestDto, UploadFileInDealFolderRequestItem } from './dto/upload-file-in-deal-folder-request.dto';
import { UploadFileInDealFolderResponseDto } from './dto/upload-file-in-deal-folder-response.dto';

@UseInterceptors(DtfsStorageExceptionTransformInterceptor)
@Controller()
export class DealFolderController {
  constructor(private readonly service: DealFolderService) {}

  @Post('sites/:siteId/deals/:dealId/documents')
  @ApiOperation({ summary: 'Upload a file in the deal folder.' })
  @ApiBody({
    type: UploadFileInDealFolderRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({ description: 'File has been uploaded.', type: UploadFileInDealFolderResponseDto })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  uploadFileInDealFolder(
    @Param() params: UploadFileInDealFolderParamsDto,
    @ValidatedArrayBody({ items: UploadFileInDealFolderRequestItem }) body: UploadFileInDealFolderRequestDto,
  ): Promise<UploadFileInDealFolderResponseDto> {
    const [{ buyerName, documentType, fileName, fileLocationPath }] = body;
    const { siteId: ukefSiteId, dealId } = params;
    return this.service.uploadFileInDealFolder(fileName, fileLocationPath, dealId, buyerName, ukefSiteId, documentType);
  }
}
