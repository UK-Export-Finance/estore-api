import { EXAMPLES, UKEFID } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedFacilityIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    length: 8,
    pattern: UKEFID.SITE_ID.REGEX,
    example: EXAMPLES.SITE_ID,
  });
