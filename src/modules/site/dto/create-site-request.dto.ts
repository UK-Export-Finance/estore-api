import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export type CreateSiteRequest = CreateSiteRequestItem[];

export class CreateSiteRequestItem {
  @ValidatedStringApiProperty({
    description: 'Exporter name',
    minLength: 1,
    maxLength: 250,
    pattern: /^[A-Za-z\d-._()\s]+$/,
  })
  readonly exporterName: string;

  constructor(exporterName: string) {
    this.exporterName = exporterName;
  }
}
