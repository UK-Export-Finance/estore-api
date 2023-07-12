import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property';
import { ValidatedSiteIdentifierApiProperty } from '@ukef/decorators/validated-site-identifier-api-property';
import { UkefId } from '@ukef/helpers';

export class CreateFacilityFolderParamsDto {
  @ValidatedSiteIdentifierApiProperty({
    description: 'The identifier of the site.',
  })
  siteId: string;

  @ValidatedDealIdentifierApiProperty({ description: 'The identifier of the deal.' })
  dealId: UkefId;
}
