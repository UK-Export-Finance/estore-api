export type CustodianProvisionJobsResponse = CustodianProvisionJobsResponseItem[];

export interface CustodianProvisionJobsResponseItem {
  Id: number;
  ServerName: string;
  Started: string;
  Completed: string;
  Failed: boolean;
  Error: string;
  Logs: string;
  Result: string;
  RequestType: number;
  AttemptNumber: number;
  Status: number;
}
