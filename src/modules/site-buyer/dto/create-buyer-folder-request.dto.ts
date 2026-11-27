import { ValidatedBuyerNameApiProperty } from '@ukef/decorators/validated-buyer-name-api-property';

export class CreateBuyerFolderRequestItem {
  @ValidatedBuyerNameApiProperty()
  buyerName: string;
}

export type CreateBuyerFolderRequestDto = CreateBuyerFolderRequestItem[];
