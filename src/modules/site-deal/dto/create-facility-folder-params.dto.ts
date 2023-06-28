import { EXAMPLES } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';
import { UkefId, UkefSiteId } from '@ukef/helpers';

// TODO apim-139 - check these are correctly named
export class CreateFacilityFolderParamsDto {
  @ValidatedStringApiProperty({ description: 'The site name/identifier returned when the site was created by POST /sites.', example: EXAMPLES.SITE_ID })
  siteId: UkefSiteId;
  @ValidatedStringApiProperty({ description: 'The identifier of the deal.', example: EXAMPLES.DEAL_ID, length: 10, pattern: /^00\d{8}$/ })
  dealId: UkefId;
}
