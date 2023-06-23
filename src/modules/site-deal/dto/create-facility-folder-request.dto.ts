import { BUYER_NAME, EXPORTER_NAME, FACILITY_IDENTIFIER } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type CreateFacilityFolderRequestDto = CreateFacilityFolderRequestItem[];
export class CreateFacilityFolderRequestItem {
  // TODO apim-139: add custom validation decorator?
  // TODO apim-139: add examples?
  // TODO apim-139: update these following APIM454
  @ValidatedStringApiProperty({ description: 'The name of the exporter used in the deal.', pattern: EXPORTER_NAME.REGEX, minLength: 1, maxLength: 250 })
  exporterName: string;
  @ValidatedStringApiProperty({ description: 'The name of the buyer used in the deal.', pattern: BUYER_NAME.REGEX, minLength: 1, maxLength: 250 })
  buyerName: string;
  @ValidatedStringApiProperty({ description: 'The identifier of the facility.', pattern: FACILITY_IDENTIFIER.REGEX, minLength: 1, maxLength: 250 })
  facilityIdentifier: string;
  @ValidatedStringApiProperty({
    description: 'The country name of the destination market of the facility.',
    pattern: /^[\w\-.()\s]+$/,
    minLength: 10,
    maxLength: 250,
  })
  destinationMarket: string;
  @ValidatedStringApiProperty({ description: 'The country name of the risk market of the facility.', pattern: /^[\w\-.()\s]+$/, minLength: 1, maxLength: 250 })
  riskMarket: string;
}
