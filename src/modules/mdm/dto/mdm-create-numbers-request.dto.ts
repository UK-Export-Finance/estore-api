export type MdmCreateNumbersRequest = MdmCreateNumbersRequestItem[];

type MdmCreateNumbersRequestItem = {
  numberTypeId: number;
  createdBy: string;
  requestingSystem: string;
};
