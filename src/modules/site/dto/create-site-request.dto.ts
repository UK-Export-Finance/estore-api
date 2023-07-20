import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';

export type CreateSiteRequest = CreateSiteRequestItem[];

export class CreateSiteRequestItem {
  @ValidatedExporterNameApiProperty()
  readonly exporterName: string;
}
