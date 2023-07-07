import { ENUMS } from '@ukef/constants';
import { DocumentTypeEnum } from '@ukef/constants/enums/document-type';
import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type UploadFileInDealFolderRequestDto = UploadFileInDealFolderRequestItem[];

export class UploadFileInDealFolderRequestItem {
  @ValidatedStringApiProperty({
    description: 'The name of the buyer used in the deal.',
    minLength: 1,
    maxLength: 250,
    pattern: /^(?!\s)[\w\-.()\s]+(?<![\s.])$/,
    example: EXAMPLES.BUYER_NAME,
  })
  buyerName: string;

  @ValidatedStringApiProperty({
    description: 'The ESTORE document type.',
    enum: ENUMS.DOCUMENT_TYPES,
    example: EXAMPLES.DOCUMENT_TYPE,
  })
  documentType: DocumentTypeEnum;

  @ValidatedStringApiProperty({
    description: 'The file name with the file extension.',
    minLength: 1,
    maxLength: 250,
    pattern: /^(?!\s)[\w\-.()\s]+(?<![\s.])$/,
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
