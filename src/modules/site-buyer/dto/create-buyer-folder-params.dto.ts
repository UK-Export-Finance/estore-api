import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';

export class CreateBuyerFolderParamsDto {
  @ValidatedSiteIdentifierApiProperty({
    description: 'The identifier of the site.',
  })
  siteId: string;
}
