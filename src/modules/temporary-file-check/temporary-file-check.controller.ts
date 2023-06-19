import { Controller, Post } from '@nestjs/common';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import {
  GetFileSizeIfExistsAndNotTooLargeRequest,
  GetFileSizeIfExistsAndNotTooLargeRequestItem,
} from './dto/get-file-size-if-exists-and-not-too-large-request.dto';
import { GetFileSizeIfExistsAndNotTooLargeResponse } from './dto/get-file-size-if-exists-and-not-too-large-response.dto';
import { FileService } from './file.service';

@Controller('temporary-file-check')
export class TemporaryFileCheckController {
  constructor(private readonly service: FileService) {}

  @Post()
  getFileSizeIfExistsAndNotTooLargeResponse(
    @ValidatedArrayBody({ items: GetFileSizeIfExistsAndNotTooLargeRequestItem }) body: GetFileSizeIfExistsAndNotTooLargeRequest,
  ): Promise<GetFileSizeIfExistsAndNotTooLargeResponse> {
    const [fileToCheck] = body;
    return this.service.getFileSizeIfExistsAndNotTooLarge(fileToCheck);
  }
}
