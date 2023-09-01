export type MdmCreateNumbersResponse = MdmCreateNumbersResponseItem[];

export interface MdmCreateNumbersResponseItem {
  id: number;
  maskedId: string;
  type: number;
  createdBy: string;
  createdDatetime: string;
  requestingSystem: string;
}
