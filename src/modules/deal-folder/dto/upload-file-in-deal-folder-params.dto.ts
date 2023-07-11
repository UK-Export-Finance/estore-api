import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property';
import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';

export class UploadFileInDealFolderParamsDto {
  @ValidatedSiteIdentifierApiProperty({
    description: 'The identifier of the site.',
  })
  siteId: string;

  @ValidatedDealIdentifierApiProperty({
    description: 'The identifier of the deal.',
  })
  dealId: string;
}
