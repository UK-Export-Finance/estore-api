export type MdmCreateNumbersRequest = MdmCreateNumbersRequestItem[];

interface MdmCreateNumbersRequestItem {
  numberTypeId: number;
  createdBy: string;
  requestingSystem: string;
}
