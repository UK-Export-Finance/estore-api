import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property';
import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';
import { UkefId, UkefSiteId } from '@ukef/helpers';

export class CreateFacilityFolderParamsDto {
  @ValidatedSiteIdentifierApiProperty({
    description: 'The identifier of the site.',
  })
  siteId: UkefSiteId;

  @ValidatedDealIdentifierApiProperty({ description: 'The identifier of the deal.' })
  dealId: UkefId;
}
