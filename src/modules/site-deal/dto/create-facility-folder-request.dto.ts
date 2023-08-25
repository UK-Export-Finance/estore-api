import { ValidatedBuyerNameApiProperty } from '@ukef/decorators/validated-buyer-name-api-property';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';

export type CreateFacilityFolderRequestDto = CreateFacilityFolderRequestItem[];
export class CreateFacilityFolderRequestItem {
  @ValidatedBuyerNameApiProperty()
  buyerName: string;

  @ValidatedFacilityIdentifierApiProperty({ description: 'The identifier of the facility.' })
  facilityIdentifier: string;
}
