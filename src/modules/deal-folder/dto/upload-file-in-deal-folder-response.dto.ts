import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class UploadFileInDealFolderResponseDto {
  @ValidatedStringApiProperty({
    description: '', // TODO (APIM-138): add description.
    example: EXAMPLES.FILE_UPLOAD,
  })
  fileUpload: string;
}
