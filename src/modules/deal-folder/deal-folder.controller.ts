import { Controller, Param, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { UploadFileInDealFolderParamsDto } from './dto/upload-file-in-deal-folder-params.dto';
import { UploadFileInDealFolderRequestDto, UploadFileInDealFolderRequestItem } from './dto/upload-file-in-deal-folder-request.dto';
import { UploadFileInDealFolderResponseDto } from './dto/upload-file-in-deal-folder-response.dto';

@Controller()
export class DealFolderController {
  constructor() {}

  @Post('sites/:siteId/deals/:dealId/documents')
  @ApiOperation({ summary: 'Upload a file in the deal folder.' })
  @ApiBody({
    type: UploadFileInDealFolderRequestItem,
    isArray: true,
  })
  @ApiCreatedResponse({ description: 'File has been uploaded.', type: UploadFileInDealFolderResponseDto, isArray: false })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse({ description: 'An internal server error has occurred.' })
  uploadFileInDealFolder(
    @Param() params: UploadFileInDealFolderParamsDto,
    @ValidatedArrayBody({ items: UploadFileInDealFolderRequestItem }) body: UploadFileInDealFolderRequestDto,
  ): void {
    params;
    body;
  }
}
