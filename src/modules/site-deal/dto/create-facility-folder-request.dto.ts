import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export type CreateFacilityFolderRequestDto = CreateFacilityFolderRequestItem[];
export class CreateFacilityFolderRequestItem {
  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the exporter used in the deal.', example: 'Example exporter name' })
  exporterName: string;
  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the buyer used in the deal.', example: 'Example buyer name' })
  buyerName: string;
  @ValidatedFacilityIdentifierApiProperty({ description: 'The identifier of the facility.' })
  facilityIdentifier: string;
}
