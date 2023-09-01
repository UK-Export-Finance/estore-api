import { ValidatedBuyerNameApiProperty } from '@ukef/decorators/validated-buyer-name-api-property';

export type CreateBuyerFolderRequestDto = CreateBuyerFolderRequestItem[];

export class CreateBuyerFolderRequestItem {
  @ValidatedBuyerNameApiProperty()
  buyerName: string;
}
