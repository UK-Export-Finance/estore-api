import { ValidatedBuyerNameApiProperty } from '@ukef/decorators/validated-buyer-name-api-property';

export class CreateBuyerFolderRequestItem {
  @ValidatedBuyerNameApiProperty()
  buyerName: string;
}

export const CreateBuyerFolderRequestDto = undefined as unknown as typeof CreateBuyerFolderRequestItem[];
export type CreateBuyerFolderRequestDto = CreateBuyerFolderRequestItem[];
