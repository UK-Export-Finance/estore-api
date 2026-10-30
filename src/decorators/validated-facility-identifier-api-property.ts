import { EXAMPLES, REGEX } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

type Options = {
  description: string;
};

export const ValidatedFacilityIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 10,
    pattern: REGEX.UKEF_ID_TEN_DIGIT,
    example: EXAMPLES.FACILITY_ID,
  });
