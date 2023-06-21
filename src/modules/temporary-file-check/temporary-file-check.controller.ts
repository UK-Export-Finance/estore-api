import { Controller, Post } from '@nestjs/common';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import { GetFileSizeRequest, GetFileSizeRequestItem } from './dto/get-file-size-request.dto';
import { GetFileSizeResponse } from './dto/get-file-size-response.dto';
import { FileService } from './file.service';

@Controller('temporary-file-check')
export class TemporaryFileCheckController {
  constructor(private readonly service: FileService) {}

  @Post()
  getFileSize(@ValidatedArrayBody({ items: GetFileSizeRequestItem }) body: GetFileSizeRequest): Promise<GetFileSizeResponse> {
    const [fileToCheck] = body;
    return this.service.getFileSize(fileToCheck);
  }
}
