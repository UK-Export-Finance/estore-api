import { EXAMPLES, REGEX } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

export const ValidatedBuyerNameApiProperty = () =>
  ValidatedStringApiProperty({
    description: 'The name of the buyer used in the deal.',
    example: EXAMPLES.BUYER_NAME,
    minLength: 1,
    maxLength: 250,
    pattern: REGEX.SHAREPOINT_SAFE_FOLDER_NAME,
  });
