import { EXAMPLES, EXPORTER_NAME } from '@ukef/constants';

import { ValidatedStringApiProperty } from './validated-string-api-property.decorator';

export const ValidatedExporterNameApiProperty = () =>
  ValidatedStringApiProperty({
    description: 'The name of the exporter used in the deal.',
    example: EXAMPLES.EXPORTER_NAME,
    minLength: 1,
    maxLength: 250,
    pattern: EXPORTER_NAME.REGEX,
  });
