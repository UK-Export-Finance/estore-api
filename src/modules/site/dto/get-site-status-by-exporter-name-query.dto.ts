import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class GetSiteStatusByExporterNameQueryDto {
  @ValidatedStringApiProperty({ description: 'Name of case site', example: 'Example Name Limited' })
  exporterName: string;
}
