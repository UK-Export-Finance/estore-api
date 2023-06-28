import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type GetFileSizeRequest = GetFileSizeRequestItem[];

export class GetFileSizeRequestItem {
  @ValidatedStringApiProperty({
    description: 'The file name with the file extension.',
    minLength: 1,
    maxLength: 250,
    pattern: /^[\w\-.()\s]+$/,
    example: EXAMPLES.FILE_NAME,
  })
  fileName: string;

  @ValidatedStringApiProperty({
    description: 'The path of the location/folder in Azure storage from which the file needs to be loaded.',
    minLength: 1,
    maxLength: 250,
    pattern: /^[\w\-:/\\()\s]+$/,
    example: EXAMPLES.FILE_LOCATION_PATH,
  })
  fileLocationPath: string;
}
