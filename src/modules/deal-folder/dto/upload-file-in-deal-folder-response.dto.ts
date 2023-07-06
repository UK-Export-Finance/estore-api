import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class UploadFileInDealFolderResponseDto {
  @ValidatedStringApiProperty({
    description: `The file name (and extension) in Sharepoint. It is called 'fileLeafRef' by Sharepoint.`,
    example: EXAMPLES.FILE_UPLOAD,
  })
  fileUpload: string;
}
