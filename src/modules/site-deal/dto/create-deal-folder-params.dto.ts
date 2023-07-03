import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';

export class CreateDealFolderParams {
  // TODO APIM-136: Update ticket with stricter siteId validation
  @ValidatedSiteIdentifierApiProperty({ description: 'The site identifier returned when the site was created by POST /sites.' })
  siteId: string;
}
