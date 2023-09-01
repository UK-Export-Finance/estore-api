import { EXAMPLES } from '@ukef/constants';
import { ValidatedBuyerNameApiProperty } from '@ukef/decorators/validated-buyer-name-api-property';
import { ValidatedDealIdentifierApiProperty } from '@ukef/decorators/validated-deal-identifier-api-property';
import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export type CreateDealFolderRequest = CreateDealFolderRequestItem[];

export class CreateDealFolderRequestItem {
  @ValidatedDealIdentifierApiProperty({ description: 'The identifier of the deal.' })
  dealIdentifier: string;

  @ValidatedBuyerNameApiProperty()
  buyerName: string;

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
