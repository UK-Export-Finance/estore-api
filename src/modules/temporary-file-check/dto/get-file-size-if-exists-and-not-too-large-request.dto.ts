import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type GetFileSizeIfExistsAndNotTooLargeRequest = GetFileSizeIfExistsAndNotTooLargeRequestItem[];

export class GetFileSizeIfExistsAndNotTooLargeRequestItem {
  @ValidatedStringApiProperty({
    description: 'The file name with the file extension.',
    minLength: 1,
    maxLength: 250,
    pattern: /^[A-Za-z\d-_.()\s]$/,
    example: EXAMPLES.FILE_NAME,
  })
  fileName: string;

  @ValidatedStringApiProperty({
    description: 'The location or file path in Azure storage from which the file needs to be loaded.', // TODO (APIM-450): check if this includes file name and extension.
    minLength: 1,
    maxLength: 250,
    pattern: /^[A-Za-z\d-_.()\s]$/,
    example: EXAMPLES.FILE_LOCATION_PATH,
  })
  fileLocationPath: string;
}
