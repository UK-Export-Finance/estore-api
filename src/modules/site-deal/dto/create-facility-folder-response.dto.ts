import { ApiResponseProperty } from '@nestjs/swagger';
import { EXAMPLES } from '@ukef/constants';

export class CreateFacilityFolderResponseDto {
  @ApiResponseProperty({ example: EXAMPLES.FOLDER_NAME })
  folderName: string;
}
