import { EXAMPLES } from '@ukef/constants';
import { ValidatedExporterNameApiProperty } from '@ukef/decorators/validated-exporter-name-api-property';
import { ValidatedFacilityIdentifierApiProperty } from '@ukef/decorators/validated-facility-identifier-api-property';
import { ValidatedSharepointResourceNameApiProperty } from '@ukef/decorators/validated-sharepoint-resource-name-api-property';

export type CreateFacilityFolderRequestDto = CreateFacilityFolderRequestItem[];
export class CreateFacilityFolderRequestItem {
  @ValidatedExporterNameApiProperty()
  exporterName: string;

  @ValidatedSharepointResourceNameApiProperty({ description: 'The name of the buyer used in the deal.', example: EXAMPLES.BUYER_NAME })
  buyerName: string;

  @ValidatedFacilityIdentifierApiProperty({ description: 'The identifier of the facility.' })
  facilityIdentifier: string;
}
