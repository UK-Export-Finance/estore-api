import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ConfigType } from '@nestjs/config';
import CustodianConfig from '@ukef/config/custodian.config';
import SharepointConfig from '@ukef/config/sharepoint.config';
import { CUSTODIAN, ENUMS } from '@ukef/constants';
import { getCustodianFolderCreationCacheKey } from '@ukef/helpers/get-custodian-folder-creation-cache-key.helper';
import { HttpClient } from '@ukef/modules/http/http.client';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { throwError } from 'rxjs';

import { CreateBuyerFolderResponseDto } from '../site-buyer/dto/create-buyer-folder-response.dto';
import { CustodianCreateAndProvisionRequest } from './dto/custodian-create-and-provision-request.dto';
import { CustodianCreateAndProvisionResponse } from './dto/custodian-create-and-provision-response.dto';
import { CustodianProvisionJobsByRequestIdRequest } from './dto/custodian-provision-jobs-request.dto';
import { CustodianProvisionJobsResponse } from './dto/custodian-provision-jobs-response.dto';
import { CustodianRecentFolderJob } from './dto/custodian-recent-folder-job.dto';
import { CustodianException } from './exception/custodian.exception';

type RequiredCustodianConfigKeys = 'custodianJobStoreTtlInMilliseconds';
type RequiredSharepointConfigKeys = 'scSiteFullUrl';

@Injectable()
export class CustodianService {
  private readonly httpClient: HttpClient;

  constructor(
    httpService: HttpService,
    @Inject(CustodianConfig.KEY)
    private readonly custodianConfig: Pick<ConfigType<typeof CustodianConfig>, RequiredCustodianConfigKeys>,
    @Inject(SharepointConfig.KEY)
    private readonly sharepointConfig: Pick<ConfigType<typeof SharepointConfig>, RequiredSharepointConfigKeys>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly logger: PinoLogger,
  ) {
    this.httpClient = new HttpClient(httpService);
  }

  async createAndProvision(itemToCreateAndProvision: CustodianCreateAndProvisionRequest): Promise<void> {
    const { Title: titleOfItemToCreateAndProvision } = itemToCreateAndProvision;
    const folderCreationCacheId = getCustodianFolderCreationCacheKey(itemToCreateAndProvision.ParentId, itemToCreateAndProvision.Title);

    const recentJob: CustodianRecentFolderJob = {
      created: new Date().toISOString(),
      status: ENUMS.FOLDER_STATUSES.SENDING_TO_CUSTODIAN,
    };

    await this.storeRecentFolderRequest(folderCreationCacheId, recentJob);

    const createAndProvisionResponse = await this.httpClient.post<CustodianCreateAndProvisionRequest, CustodianCreateAndProvisionResponse>({
      path: '/Create/CreateAndProvision',
      requestBody: itemToCreateAndProvision,
      headers: { 'Content-Type': 'application/json' },
      onError: (error: Error) => {
        recentJob.status = ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED;
        this.storeRecentFolderRequest(folderCreationCacheId, recentJob);
        return throwError(
          () => new CustodianException(`Failed to create and provision an item via Custodian with title ${titleOfItemToCreateAndProvision}.`, error),
        );
      },
    });
    recentJob.requestId = createAndProvisionResponse.data.RequestGuid;
    recentJob.status = ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN;

    await this.storeRecentFolderRequest(folderCreationCacheId, recentJob);
  }

  async getApiResponseIfFolderInCustodian(parentFolderId: number, folderName: string, response: Response): Promise<CreateBuyerFolderResponseDto | null> {
    const custodianRecentFolderJob = await this.getRecentFolderCreationJob(parentFolderId, folderName);

    if (custodianRecentFolderJob?.status) {
      let httpStatusCode;
      if (custodianRecentFolderJob.status === ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_COMPLETED) {
        httpStatusCode = HttpStatus.OK;
      } else if (custodianRecentFolderJob.status === ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED) {
        httpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      } else {
        httpStatusCode = HttpStatus.ACCEPTED;
      }

      response.status(httpStatusCode);
      return { folderName, status: custodianRecentFolderJob.status };
    }
    return null;
  }

  private getRecentFolderCreationJob(parentSharepointListId: number, folderName: string): Promise<CustodianRecentFolderJob | null> {
    const folderCreationCacheId = getCustodianFolderCreationCacheKey(parentSharepointListId, folderName);
    return this.getRecentFolderCreationJobByCacheId(folderCreationCacheId);
  }

  private async getRecentFolderCreationJobByCacheId(folderCreationCacheId: string): Promise<CustodianRecentFolderJob | null> {
    const recentJob = await this.cacheManager.get<CustodianRecentFolderJob>(folderCreationCacheId);

    if (!recentJob) {
      this.logger.debug("Custodian job for folder creation didn't start yet.");
      return;
    }

    if (recentJob.status === ENUMS.FOLDER_STATUSES.SENDING_TO_CUSTODIAN) {
      throw new BadRequestException('Custodian job for folder creation is still being sent to Custodian. Most likely we received multiple calls at same time.');
    }

    if (recentJob.status === ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED) {
      this.logger.warn('Found cache with failed Custodian job for folder creation. Lets try to create new job.');
      return;
    }

    if (
      recentJob.status === ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN ||
      recentJob.status === ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET ||
      recentJob.status === ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_STARTED ||
      recentJob.status === ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED
    ) {
      const custodianJobStatus = await this.httpClient.post<CustodianProvisionJobsByRequestIdRequest, CustodianProvisionJobsResponse>({
        path: '/Provisioning/JobsByRequestId',
        requestBody: {
          RequestId: recentJob.requestId,
          SPHostUrl: this.sharepointConfig.scSiteFullUrl,
        },
        headers: { 'Content-Type': 'application/json' },
        onError: (error: Error) => {
          return throwError(() => new CustodianException(`Failed to get an Provisioning job by request id for cache id ${folderCreationCacheId}.`, error));
        },
      });
      if (custodianJobStatus?.data?.length) {
        if (custodianJobStatus?.data?.[0]?.Failed) {
          recentJob.status = ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED;
        } else if (custodianJobStatus?.data?.[0]?.Started === CUSTODIAN.EMPTY_DATE) {
          recentJob.status = ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_STARTED;
        } else if (custodianJobStatus?.data?.[0]?.Completed === CUSTODIAN.EMPTY_DATE) {
          recentJob.status = ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED;
        } else if (custodianJobStatus?.data?.[0]?.Completed !== CUSTODIAN.EMPTY_DATE) {
          recentJob.status = ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_COMPLETED;
        }
        recentJob.custodianJobRecords = custodianJobStatus.data;
        this.storeRecentFolderRequest(folderCreationCacheId, recentJob);
        return recentJob;
      } else if (recentJob.status === ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN) {
        recentJob.status = ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET;
        this.storeRecentFolderRequest(folderCreationCacheId, recentJob);
      }
    }
    return recentJob;
  }

  private async storeRecentFolderRequest(cid: string, recentJob: CustodianRecentFolderJob): Promise<void> {
    const recentJobWithExtraFields = {
      ...recentJob,
      modified: new Date().toISOString(),
      cacheId: cid,
    };
    this.logger.debug('Setting Custodian recent folder creation job cache %o.', recentJobWithExtraFields);
    await this.cacheManager.set(cid, recentJobWithExtraFields, this.custodianConfig.custodianJobStoreTtlInMilliseconds);
  }
}
