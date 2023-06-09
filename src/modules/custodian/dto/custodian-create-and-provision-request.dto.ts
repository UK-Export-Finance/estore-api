export interface CustodianCreateAndProvisionRequest {
  Title: string;
  Id?: number;
  Code?: string;
  TemplateId: string;
  ParentId?: number;
  InterestedParties?: string;
  Secure?: boolean;
  DoNotSubscribeInterestedParties?: boolean;
  Links?: []; // Custodian supports sending an array of links, but we do not use this functionality.
  FormButton?: string;
  HasAttachments?: boolean;
  Metadata?: MetadataItem[];
  TypeGuid: string;
  SPHostUrl: string;
}

interface MetadataItem {
  Name: string;
  Values: string[];
}
