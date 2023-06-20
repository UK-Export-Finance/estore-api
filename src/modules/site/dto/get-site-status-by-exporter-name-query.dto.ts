import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class GetSiteStatusByExporterNameQueryDto {
  @ValidatedStringApiProperty({ description: 'The name of the exporter used in the deal.', example: 'Example Name Limited' })
  exporterName: string;
}
