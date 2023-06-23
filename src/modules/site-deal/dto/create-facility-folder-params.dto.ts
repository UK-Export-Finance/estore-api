import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class CreateFacilityFolderParamsDto {
  // TODO apim-139: update these following APIM454
  // TODO apim-139: make UkefSiteId with examples
  // TODO apim-139: make DealId with examples
  @ValidatedStringApiProperty({ description: 'The site name/identifier returned when the site was created by POST /sites.', example: 'Example Name Limited' })
  siteId: string;
  @ValidatedStringApiProperty({ description: 'The identifier of the deal.', example: '0010000000', length: 10, pattern: /^00\d{8}$/ })
  dealId: string;
}
