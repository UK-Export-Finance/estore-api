import { REGEX } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

type Options = {
  description: string;
  example: string;
};

export const ValidatedSharepointResourceNameApiProperty = ({ description, example }: Options) =>
  ValidatedStringApiProperty({
    description,
    minLength: 1,
    maxLength: 250,
    pattern: REGEX.SHAREPOINT_RESOURCE_NAME,
    example,
  });
