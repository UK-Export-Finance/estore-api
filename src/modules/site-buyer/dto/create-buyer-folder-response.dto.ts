import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateBuyerFolderResponseDto {
  @ApiResponseProperty({ example: EXAMPLES.BUYER_NAME })
  buyerName: string;
}
