import { EXPORTER_NAME } from '@ukef/constants/exporter-name.constant';
import { ValidatedStringApiProperty } from '@ukef/decorators/validated-string-api-property.decorator';

export class GetSiteStatusByExporterNameQueryDto {
  @ValidatedStringApiProperty({
    description: 'The name of the exporter used in the deal.',
    example: 'Example Name Limited',
    minLength: 1,
    maxLength: 250,
    pattern: EXPORTER_NAME.REGEX,
  })
  exporterName: string;
}
