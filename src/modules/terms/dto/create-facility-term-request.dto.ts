import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

export type CreateFacilityTermRequest = CreateFacilityTermRequestItem[];
export class CreateFacilityTermRequestItem {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID to create in termStore.',
  })
  readonly id: UkefId;
}
