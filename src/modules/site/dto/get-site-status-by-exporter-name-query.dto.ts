import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export class GetSiteStatusByExporterNameQueryDto {
  @ValidatedSharepointResourceNameApiProperty({
    description: 'The name of the exporter used in the deal.',
    example: 'Example Name Limited',
  })
  exporterName: string;
}
