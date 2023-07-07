import { ApiProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateFolderResponseDto {
  @ApiProperty({ description: 'The name of the created folder.', example: EXAMPLES.FOLDER_NAME })
  folderName: string;
}
