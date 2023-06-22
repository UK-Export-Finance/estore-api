import { EXPORTER_NAME } from '@ukef/constants';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type CreateSiteRequest = CreateSiteRequestItem[];

export class CreateSiteRequestItem {
  @ValidatedStringApiProperty({
    description: 'The name of the exporter used in the deal.',
    example: 'Example Name Limited',
    minLength: 1,
    maxLength: 250,
    pattern: EXPORTER_NAME.REGEX,
  })
  readonly exporterName: string;

  constructor(exporterName: string) {
    this.exporterName = exporterName;
  }
}
