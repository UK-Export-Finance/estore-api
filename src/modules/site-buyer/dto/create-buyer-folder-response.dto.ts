import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { FolderStatusEnum } from '@ukef/constants/enums/folder-status';

export class CreateBuyerFolderResponseDto {
  @ApiResponseProperty({ example: EXAMPLES.BUYER_NAME })
  folderName: string;

  @ApiProperty({
    description: 'Folder creation takes some time, status field provides more information about creation progress',
    example: FolderStatusEnum.SENT_TO_CUSTODIAN,
    enum: FolderStatusEnum,
  })
  status?: FolderStatusEnum;
}
