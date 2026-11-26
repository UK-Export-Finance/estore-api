import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import type { UkefId } from '@ukef/helpers';

export class CreateFacilityTermRequestItem {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID to create in termStore.',
  })
  readonly id: UkefId;
}

export type CreateFacilityTermRequest = CreateFacilityTermRequestItem[];
