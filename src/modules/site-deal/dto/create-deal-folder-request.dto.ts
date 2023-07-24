import { EXAMPLES } from '@ukef/constants';
import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property';
import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';
import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export type CreateDealFolderRequest = CreateDealFolderRequestItem[];

export class CreateDealFolderRequestItem {
  @ValidatedDealIdentifierApiProperty({ description: 'The identifier of the deal.' })
  dealIdentifier: string;

  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the buyer used in the deal.', example: EXAMPLES.BUYER_NAME })
  buyerName: string;

  @ValidatedExporterNameApiProperty()
  exporterName: string;

  @ValidatedSharepointResourceNameApiProperty({
    description: 'The country name of the destination market of the deal.',
    example: EXAMPLES.MARKET,
  })
  destinationMarket: string;

  @ValidatedSharepointResourceNameApiProperty({
    description: 'The country name of the risk market of the deal.',
    example: EXAMPLES.MARKET,
  })
  riskMarket: string;
}
