import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';

export class GetSiteStatusByExporterNameQueryDto {
  @ValidatedExporterNameApiProperty()
  exporterName: string;
}
