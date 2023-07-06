import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';
import { UkefSiteId } from '@ukef/helpers';

export class CreateBuyerFolderParamsDto {
  // TODO apim-139: This is more restrictive than the ticket.
  @ValidatedSiteIdentifierApiProperty({ description: 'The site name/identifier returned when the site was created by POST /sites.' })
  siteId: UkefSiteId;
}
