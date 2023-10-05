import { FolderStatusEnum } from '@ukef/constants/enums/folder-status';
import { DateString } from '@ukef/helpers/date-string.type';

import { CustodianProvisionJobsResponse } from './custodian-provision-jobs-response.dto';

export interface CustodianRecentFolderJob {
  requestId?: string;
  status: FolderStatusEnum;
  created: DateString;
  modified?: DateString;
  cacheId?: string;
  custodianJobRecords?: CustodianProvisionJobsResponse;
}
