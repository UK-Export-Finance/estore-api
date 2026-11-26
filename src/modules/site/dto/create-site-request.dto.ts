import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';

export class CreateSiteRequestItem {
  @ValidatedExporterNameApiProperty()
  readonly exporterName: string;
}

export type CreateSiteRequest = CreateSiteRequestItem[];
