import { EXAMPLES } from '@ukef/constants/examples.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class UploadFileInDealFolderParamsDto {
  @ValidatedStringApiProperty({
    description: 'The site identifier returned when the site was created by POST /sites.',
    example: EXAMPLES.SITE_ID,
  })
  siteId: string;

  @ValidatedStringApiProperty({
    description: 'The identifier of the deal.',
    length: 10,
    pattern: /^00\d{8}$/,
    example: EXAMPLES.DEAL_ID,
  })
  dealId: string;
}
