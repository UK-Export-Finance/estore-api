import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';

export class GetSiteStatusByExporterNameQueryDto {
  // TODO apim-474 this property is now more restrictive with length
  @ValidatedExporterNameApiProperty()
  exporterName: string;
}
