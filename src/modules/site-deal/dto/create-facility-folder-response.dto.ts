import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';
import { FolderStatusEnum } from '@ukef/constants/enums/folder-status';

export class CreateFolderResponseDto {
  @ApiProperty({ description: 'The name of the created folder.', example: EXAMPLES.FOLDER_NAME })
  folderName: string;

  @ApiProperty({
    description: 'Folder creation takes some time, status field provides more information about creation progress',
    example: FolderStatusEnum.SENT_TO_CUSTODIAN,
  })
  status?: FolderStatusEnum;
}
