import { ApiProperty } from '@nestjs/swagger';
import { MAX_FILE_SIZE } from '@ukef/constants';
import { EXAMPLES } from '@ukef/constants/examples.constant';

export class GetFileSizeIfExistsAndNotTooLargeResponse {
  @ApiProperty({ description: 'The file size in bytes.', maximum: MAX_FILE_SIZE, example: EXAMPLES.FILE_SIZE })
  fileSize: number;
}
