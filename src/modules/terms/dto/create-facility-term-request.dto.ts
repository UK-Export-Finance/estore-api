import { EXAMPLES, UKEFID } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class CreateFacilityTermRequestItem {
  @ValidatedStringApiProperty({
    description: 'The facility ID to create in termStore.',
    example: EXAMPLES.FACILITY_ID,
    minLength: 10,
    maxLength: 10,
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
  })
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}
