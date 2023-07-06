import { EXAMPLES } from '@ukef/constants';
import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export type CreateBuyerFolderRequestDto = CreateBuyerFolderRequestItem[];
export class CreateBuyerFolderRequestItem {
  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the exporter used in the deal.', example: 'Example exporter name' })
  exporterName: string;
  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the buyer used in the deal.', example: EXAMPLES.BUYER_NAME })
  buyerName: string;
}
