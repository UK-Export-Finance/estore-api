import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class UploadFileInDealFolderResponseDto {
  @ValidatedStringApiProperty({
    description: `The path to the file in SharePoint.`,
    example: EXAMPLES.FILE_UPLOAD,
  })
  fileUpload: string;
}
