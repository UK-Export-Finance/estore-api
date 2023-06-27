import { ApiProperty } from '@nestjs/swagger';
import { MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { EXAMPLES } from '@ukef/constants/examples.constant';

export class GetFileSizeResponse {
  @ApiProperty({ description: 'The file size in bytes.', maximum: MAX_FILE_SIZE_BYTES, example: EXAMPLES.FILE_SIZE })
  fileSize: number;
}
