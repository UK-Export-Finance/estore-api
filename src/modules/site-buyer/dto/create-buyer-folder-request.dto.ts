import { ValidatedBuyerNameApiProperty } from '@ukef/decorators/validated-buyer-name-api-property';
import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';

export type CreateBuyerFolderRequestDto = CreateBuyerFolderRequestItem[];

export class CreateBuyerFolderRequestItem {
  @ValidatedExporterNameApiProperty()
  exporterName: string;

  @ValidatedBuyerNameApiProperty()
  buyerName: string;
}
