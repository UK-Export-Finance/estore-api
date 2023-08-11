import { BUYER_NAME, EXAMPLES } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

export const ValidatedBuyerNameApiProperty = () =>
  ValidatedStringApiProperty({
    description: 'The name of the buyer used in the deal.',
    example: EXAMPLES.BUYER_NAME,
    minLength: 1,
    maxLength: 250,
    pattern: BUYER_NAME.REGEX,
  });
