import { SHAREPOINT } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

interface Options {
  description: string;
  example: string;
}

export const ValidatedSharepointResourceNameApiProperty = ({ description, example }: Options) =>
  ValidatedStringApiProperty({
    description,
    minLength: 10,
    maxLength: 250,
    pattern: SHAREPOINT.RESOURCE_NAME.REGEX,
    example: example,
  });
