import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';
import { DtfsStorageExceptionTransformInterceptor } from '@ukef/modules/dtfs-storage/dtfs-storage-exception-transform.interceptor';

import { GetFileSizeRequest, GetFileSizeRequestItem } from './dto/get-file-size-request.dto';
import { GetFileSizeResponse } from './dto/get-file-size-response.dto';
import { FileService } from './file.service';

@UseInterceptors(DtfsStorageExceptionTransformInterceptor)
@Controller('temporary-file-check')
export class TemporaryFileCheckController {
  constructor(private readonly service: FileService) {}

  @Post()
  @ApiBody({
    type: GetFileSizeRequestItem,
    isArray: true,
  })
  getFileSize(@ValidatedArrayBody({ items: GetFileSizeRequestItem }) body: GetFileSizeRequest): Promise<GetFileSizeResponse> {
    const [fileToCheck] = body;
    return this.service.getFileSize(fileToCheck);
  }
}
