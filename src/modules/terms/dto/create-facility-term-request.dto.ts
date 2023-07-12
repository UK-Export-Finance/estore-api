import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';

export type CreateFacilityTermRequest = CreateFacilityTermRequestItem[];
export class CreateFacilityTermRequestItem {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID to create in termStore.',
  })
  readonly id: string;
}
