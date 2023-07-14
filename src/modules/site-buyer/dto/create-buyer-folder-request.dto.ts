import { EXAMPLES } from '@ukef/constants';
import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';
import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export type CreateBuyerFolderRequestDto = CreateBuyerFolderRequestItem[];

export class CreateBuyerFolderRequestItem {
  // TODO apim-474 this property is now more restrictive with length
  @ValidatedExporterNameApiProperty()
  exporterName: string;

  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the buyer used in the deal.', example: EXAMPLES.BUYER_NAME })
  buyerName: string;
}
