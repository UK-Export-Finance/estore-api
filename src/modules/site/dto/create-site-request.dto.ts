import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';

export class CreateSiteRequestItem {
  @ValidatedExporterNameApiProperty()
  readonly exporterName: string;
}

export const CreateSiteRequest = undefined as unknown as typeof CreateSiteRequestItem[];
export type CreateSiteRequest = CreateSiteRequestItem[];
