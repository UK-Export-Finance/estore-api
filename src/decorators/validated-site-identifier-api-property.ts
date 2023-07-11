import { EXAMPLES } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
}

export const ValidatedSiteIdentifierApiProperty = ({ description }: Options) =>
  ValidatedStringApiProperty({
    description,
    minLength: 1,
    example: EXAMPLES.SITE_ID,
  });
