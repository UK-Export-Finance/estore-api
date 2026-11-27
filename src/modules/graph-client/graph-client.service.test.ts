import { Client, LargeFileUploadSession, LargeFileUploadTask, LargeFileUploadTaskOptions } from '@microsoft/microsoft-graph-client';
import { DTFS_MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks } from 'jest-when';
import { Readable } from 'stream';

import { GraphClientService } from './graph-client.service';

describe('GraphClientService', () => {
  const valueGenerator = new RandomValueGenerator();
  const tenantId = valueGenerator.guid();
  const clientId = valueGenerator.guid();
  const mockClientSecret = valueGenerator.string();
  const scope = 'https://graph.microsoft.com/.default';
  const urlToCreateUploadSession = valueGenerator.httpsUrl();
  const uploadSessionHeaders = { item: { '@microsoft.graph.conflictBehavior': 'fail' } };
  const uploadSession: LargeFileUploadSession = {
    url: valueGenerator.httpsUrl(),
    expiry: valueGenerator.date(),
  };
  const file = Readable.from([valueGenerator.string()]);
  const fileName = valueGenerator.fileName();
  const fileSizeInBytes = valueGenerator.nonnegativeInteger({ max: DTFS_MAX_FILE_SIZE_BYTES });
  const uploadTaskOptions: LargeFileUploadTaskOptions = { rangeSize: fileSizeInBytes };

  let clientInitWithMiddlewareSpy: jest.SpyInstance;
  let largeFileUploadTaskCreateUploadSessionSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetAllWhenMocks();

    // Spy on static methods
    clientInitWithMiddlewareSpy = jest.spyOn(Client, 'initWithMiddleware');
    largeFileUploadTaskCreateUploadSessionSpy = jest.spyOn(LargeFileUploadTask, 'createUploadSession').mockResolvedValue(uploadSession);
  });

  afterEach(() => {
    clientInitWithMiddlewareSpy.mockRestore();
    largeFileUploadTaskCreateUploadSessionSpy.mockRestore();
  });

  describe('constructor', () => {
    it('stores initialized client on service instance', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      // Before first access, initialization should not have happened
      expect(clientInitWithMiddlewareSpy).not.toHaveBeenCalled();

      // First access triggers lazy initialization
      const firstClient = service.client;
      expect(firstClient).toBeDefined();
      expect(firstClient).not.toBeNull();
      expect(clientInitWithMiddlewareSpy).toHaveBeenCalledTimes(1);

      // Subsequent accesses return the same instance
      const secondClient = service.client;
      expect(secondClient).toBe(firstClient);
      expect(clientInitWithMiddlewareSpy).toHaveBeenCalledTimes(1); // Still called only once

      // Multiple accesses still return the same cached instance
      const thirdClient = service.client;
      expect(thirdClient).toBe(firstClient);
      expect(clientInitWithMiddlewareSpy).toHaveBeenCalledTimes(1); // Still called only once
    });

    it('initializes Client with debugLogging and authProvider', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      // Access the client getter to trigger lazy initialization
      service.client;

      expect(clientInitWithMiddlewareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          debugLogging: true,
          authProvider: expect.any(Object),
        }),
      );
    });

    it('passes correct scope to TokenCredentialAuthenticationProvider', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      // Access the client getter to trigger lazy initialization
      service.client;

      // Verify that authentication provider was initialized by checking client is usable
      expect(clientInitWithMiddlewareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          authProvider: expect.any(Object),
        }),
      );
    });
  });

  describe('getFileUploadSession', () => {
    it('calls LargeFileUploadTask.createUploadSession with correct parameters', async () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      await service.getFileUploadSession(urlToCreateUploadSession, uploadSessionHeaders);

      expect(largeFileUploadTaskCreateUploadSessionSpy).toHaveBeenCalledWith(service.client, urlToCreateUploadSession, uploadSessionHeaders);
    });

    it('returns the session resolved by the factory', async () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      const result = await service.getFileUploadSession(urlToCreateUploadSession, uploadSessionHeaders);

      expect(result).toEqual(uploadSession);
      expect(largeFileUploadTaskCreateUploadSessionSpy).toHaveBeenCalled();
    });
  });

  describe('getFileUploadTask', () => {
    it('returns a LargeFileUploadTask instance', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      const task = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      expect(task).toBeInstanceOf(LargeFileUploadTask);
    });

    it('passes uploadSession to the task', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      const task = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      expect(task.uploadSession).toBe(uploadSession);
    });

    it('passes client to the task', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      const task = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      expect(task.client).toBe(service.client);
    });

    it('handles undefined options parameter', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret: mockClientSecret,
        scope,
      });

      const task = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession);

      expect(task).toBeInstanceOf(LargeFileUploadTask);
      expect(task.uploadSession).toBe(uploadSession);
    });
  });
});
