import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { UkefId } from '@ukef/helpers';

export class CreateFacilityTermRequestItem {
  @ValidatedFacilityIdentifierApiProperty({
    description: 'The facility ID to create in termStore.',
  })
  readonly id: UkefId;
}

export const CreateFacilityTermRequest = undefined as unknown as typeof CreateFacilityTermRequestItem[];
export type CreateFacilityTermRequest = CreateFacilityTermRequestItem[];
