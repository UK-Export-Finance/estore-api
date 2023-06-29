import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property';
import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';
import { UkefId, UkefSiteId } from '@ukef/helpers';

export class CreateFacilityFolderParamsDto {
  // TODO apim-139: This is more restrictive than the ticket.
  @ValidatedSiteIdentifierApiProperty({ description: 'The site name/identifier returned when the site was created by POST /sites.' })
  siteId: UkefSiteId;
  @ValidatedDealIdentifierApiProperty({ description: 'The identifier of the deal.' })
  dealId: UkefId;
}
