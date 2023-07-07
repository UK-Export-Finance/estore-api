import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';

export class CreateDealFolderParams {
  @ValidatedSiteIdentifierApiProperty({ description: 'The site identifier returned when the site was created by POST /sites.' })
  siteId: string;
}
