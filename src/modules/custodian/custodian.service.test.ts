import { HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common/exceptions';
import { CUSTODIAN, ENUMS } from '@ukef/constants';
import { getCustodianFolderCreationCacheKey } from '@ukef/helpers/get-custodian-folder-creation-cache-key.helper';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError } from 'axios';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { when } from 'jest-when';
import { PinoLogger } from 'nestjs-pino';
import { of, throwError } from 'rxjs';

import { CustodianService } from './custodian.service';
import { CustodianCreateAndProvisionRequest } from './dto/custodian-create-and-provision-request.dto';
import { CustodianCreateAndProvisionResponse } from './dto/custodian-create-and-provision-response.dto';
import { CustodianException } from './exception/custodian.exception';

describe('CustodianService', () => {
  const valueGenerator = new RandomValueGenerator();
  const custodianRequestId = valueGenerator.string();
  const configScSiteFullUrl = valueGenerator.httpsUrl();
  const jobStoreTtl = 60000;
  const folderParentId = valueGenerator.nonnegativeInteger();
  const folderName = valueGenerator.string();
  const httpResponseGenerator = (data) => of({ data, status: 200, statusText: 'OK' });
  const cacheId = getCustodianFolderCreationCacheKey(folderParentId, folderName);
  const mockDate = new Date();

  let httpServicePost: jest.Mock;
  let service: CustodianService;
  let dateSpy;

  const res: Response = {
    status: jest.fn().mockReturnThis(),
  } as any;

  const cacheManagerGet = jest.fn();
  const cacheManagerSet = jest.fn();
  const cacheManager: Cache = {
    get: cacheManagerGet,
    set: cacheManagerSet,
    del: jest.fn(),
    reset: jest.fn(),
    wrap: jest.fn(),
    store: null,
  };

  const logger = new PinoLogger({});
  const loggerWarn = jest.fn();
  logger.warn = loggerWarn;

  beforeEach(() => {
    jest.resetAllMocks();
    const httpService = new HttpService();
    httpServicePost = jest.fn();
    httpService.post = httpServicePost;

    service = new CustodianService(
      httpService,
      {
        custodianJobStoreTtlInMilliseconds: jobStoreTtl,
      },
      {
        scSiteFullUrl: configScSiteFullUrl,
      },
      cacheManager,
      logger,
    );
  });

  describe('createAndProvision', () => {
    beforeEach(() => {
      dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    });

    afterEach(() => {
      dateSpy.mockRestore();
    });

    const itemToCreateAndProvision: CustodianCreateAndProvisionRequest = {
      Title: folderName,
      Id: valueGenerator.nonnegativeInteger(),
      Code: valueGenerator.string(),
      TemplateId: valueGenerator.string(),
      ParentId: folderParentId,
      InterestedParties: valueGenerator.string(),
      Secure: valueGenerator.boolean(),
      DoNotSubscribeInterestedParties: valueGenerator.boolean(),
      Links: [],
      FormButton: valueGenerator.string(),
      HasAttachments: valueGenerator.boolean(),
      Metadata: [
        {
          Name: valueGenerator.string(),
          Values: [valueGenerator.string(), valueGenerator.string()],
        },
        {
          Name: valueGenerator.string(),
          Values: [valueGenerator.string()],
        },
        {
          Name: valueGenerator.string(),
          Values: [],
        },
      ],
      TypeGuid: valueGenerator.string(),
      SPHostUrl: valueGenerator.string(),
    };

    const createdItem: CustodianCreateAndProvisionResponse = {
      Id: valueGenerator.nonnegativeInteger(),
      RequestGuid: custodianRequestId,
    };

    const expectedHttpServicePostArgs: [string, object, object] = [
      '/Create/CreateAndProvision',
      itemToCreateAndProvision,
      { headers: { 'Content-Type': 'application/json' } },
    ];

    const expectedCacheSendingState = {
      created: mockDate.toISOString(),
      status: ENUMS.FOLDER_STATUSES.SENDING_TO_CUSTODIAN,
      cacheId,
      modified: mockDate.toISOString(),
    };
    const expectedCacheSentState = {
      created: mockDate.toISOString(),
      requestId: custodianRequestId,
      status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN,
      cacheId,
      modified: mockDate.toISOString(),
    };

    it('sends a POST to the Custodian /Create/CreateAndProvision endpoint with the specified item to create and provision', async () => {
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(
          of({
            data: createdItem,
            status: 201,
            statusText: 'Created',
            config: undefined,
            headers: undefined,
          }),
        );

      await service.createAndProvision(itemToCreateAndProvision);

      expect(httpServicePost).toHaveBeenCalledTimes(1);
      expect(httpServicePost).toHaveBeenCalledWith(...expectedHttpServicePostArgs);

      expect(cacheManagerSet).toHaveBeenCalledTimes(2);
      expect(cacheManagerSet).toHaveBeenCalledWith(cacheId, expectedCacheSendingState, jobStoreTtl);
      expect(cacheManagerSet).toHaveBeenCalledWith(cacheId, expectedCacheSentState, jobStoreTtl);
    });

    it('throws a CustodianException if the request to Custodian fails', async () => {
      const axiosRequestError = new AxiosError();
      when(httpServicePost)
        .calledWith(...expectedHttpServicePostArgs)
        .mockReturnValueOnce(throwError(() => axiosRequestError));

      const createNumbersPromise = service.createAndProvision(itemToCreateAndProvision);

      await expect(createNumbersPromise).rejects.toBeInstanceOf(CustodianException);
      await expect(createNumbersPromise).rejects.toThrow(`Failed to create and provision an item via Custodian with title ${folderName}.`);
      await expect(createNumbersPromise).rejects.toHaveProperty('innerError', axiosRequestError);
    });
  });

  describe('getApiResponseIfFolderInCustodian', () => {
    const expectedHttpServiceReadJobArgs: [string, object, object] = [
      '/Provisioning/JobsByRequestId',
      {
        RequestId: custodianRequestId,
        SPHostUrl: configScSiteFullUrl,
      },
      { headers: { 'Content-Type': 'application/json' } },
    ];

    it('returns null if no cache id is stored for folder', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce(false);
      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(response).toBeNull();
    });

    it('returns status CUSTODIAN_JOB_NOT_READABLE_YET if custodian job response is empty', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });
      when(httpServicePost)
        .calledWith(...expectedHttpServiceReadJobArgs)
        .mockReturnValueOnce(httpResponseGenerator([]));
      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(response).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET });
    });

    it('returns response with status CUSTODIAN_JOB_NOT_STARTED if custodian job no start and no completion dates', async () => {
      when(cacheManagerGet)
        .calledWith(cacheId)
        .mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_READABLE_YET });
      when(httpServicePost)
        .calledWith(...expectedHttpServiceReadJobArgs)
        .mockReturnValueOnce(
          httpResponseGenerator([
            {
              Started: CUSTODIAN.EMPTY_DATE,
              Completed: CUSTODIAN.EMPTY_DATE,
              Failed: false,
            },
          ]),
        );
      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(response).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_STARTED });
    });

    it('returns null with status CUSTODIAN_JOB_STARTED if custodian job has start, but no completion date', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_NOT_STARTED });
      when(httpServicePost)
        .calledWith(...expectedHttpServiceReadJobArgs)
        .mockReturnValueOnce(
          httpResponseGenerator([
            {
              Started: valueGenerator.dateTimeString(),
              Completed: CUSTODIAN.EMPTY_DATE,
              Failed: false,
            },
          ]),
        );
      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(response).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED });
    });

    it('returns response with status CUSTODIAN_JOB_COMPLETED if custodian job has completion date', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED });
      when(httpServicePost)
        .calledWith(...expectedHttpServiceReadJobArgs)
        .mockReturnValueOnce(
          httpResponseGenerator([
            {
              Started: valueGenerator.dateTimeString(),
              Completed: valueGenerator.dateTimeString(),
              Failed: false,
            },
          ]),
        );
      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(response).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_COMPLETED });
    });

    it('returns response with status CUSTODIAN_JOB_FAILED if custodian job failed flag is set to true', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_STARTED });
      when(httpServicePost)
        .calledWith(...expectedHttpServiceReadJobArgs)
        .mockReturnValueOnce(
          httpResponseGenerator([
            {
              Started: valueGenerator.dateTimeString(),
              Completed: valueGenerator.dateTimeString(),
              Failed: true,
            },
          ]),
        );
      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(response).toEqual({ folderName, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED });
      expect(loggerWarn).not.toHaveBeenCalled();
    });

    it('returns null if custodian job failed in previous run, and we will allow repeated call', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.CUSTODIAN_JOB_FAILED });

      const response = await service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(response).toBeNull();
      expect(loggerWarn).toHaveBeenCalledWith("Found cache with failed Custodian job for folder creation. Let's try to create new job.");
    });

    it('throws exception if job is still being sent to Custodian, duplicate call detected', async () => {
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.SENDING_TO_CUSTODIAN });

      const responsePromise = service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      await expect(responsePromise).rejects.toBeInstanceOf(BadRequestException);
      await expect(responsePromise).rejects.toThrow(
        'Custodian job for folder creation is still being sent to Custodian. Most likely we received multiple calls at same time.',
      );
    });

    it('throws exception if reading job from custodian fails', async () => {
      const axiosError = new AxiosError();
      const errorBody = { errorMessage: valueGenerator.string() };
      axiosError.response = {
        data: errorBody,
        status: 401,
        statusText: 'Unauthorized',
        headers: undefined,
        config: undefined,
      };
      when(cacheManagerGet).calledWith(cacheId).mockReturnValueOnce({ requestId: custodianRequestId, status: ENUMS.FOLDER_STATUSES.SENT_TO_CUSTODIAN });
      when(httpServicePost)
        .calledWith(...expectedHttpServiceReadJobArgs)
        .mockReturnValueOnce(throwError(() => axiosError));

      const responsePromise = service.getApiResponseIfFolderInCustodian(folderParentId, folderName, res);

      await expect(responsePromise).rejects.toBeInstanceOf(CustodianException);
      await expect(responsePromise).rejects.toThrow(`Failed to get a Provisioning job by request id for cache id ${cacheId}.`);
      await expect(responsePromise).rejects.toHaveProperty('innerError', axiosError);
    });
  });
});
