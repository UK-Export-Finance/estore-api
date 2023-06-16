import { Controller, Post } from '@nestjs/common';
import { ValidatedArrayBody } from '@ukef/decorators/validated-array-body.decorator';

import {
  ReturnFileSizeIfExistsAndNotTooLargeRequest,
  ReturnFileSizeIfExistsAndNotTooLargeRequestItem,
} from './dto/return-file-size-if-exists-and-not-too-large-request.dto';
import { ReturnFileSizeIfExistsAndNotTooLargeResponse } from './dto/return-file-size-if-exists-and-not-too-large-response.dto';
import { FileService } from './file.service';

@Controller('temporary-file-check')
export class TemporaryFileCheckController {
  constructor(private readonly service: FileService) {}

  @Post()
  returnFileSizeIfExistsAndNotTooLargeResponse(
    @ValidatedArrayBody({ items: ReturnFileSizeIfExistsAndNotTooLargeRequestItem }) body: ReturnFileSizeIfExistsAndNotTooLargeRequest,
  ): Promise<ReturnFileSizeIfExistsAndNotTooLargeResponse> {
    const [fileToCheck] = body;
    return this.service.returnFileSizeIfExistsAndNotTooLargeResponse(fileToCheck);
  }
}
