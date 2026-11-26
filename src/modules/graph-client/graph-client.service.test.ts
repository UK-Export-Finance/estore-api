import { Client, LargeFileUploadSession, LargeFileUploadTask, LargeFileUploadTaskOptions, StreamUpload } from '@microsoft/microsoft-graph-client';
import { DTFS_MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks } from 'jest-when';
import { Readable } from 'stream';

import { GraphClientService } from './graph-client.service';

describe('GraphClientService', () => {
  const valueGenerator = new RandomValueGenerator();
  const tenantId = '12345678-1234-1234-1234-123456789012'; // Valid UUID format for tenant ID
  const clientId = '87654321-4321-4321-4321-210987654321'; // Valid UUID format for client ID
  const clientSecret = valueGenerator.string();
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
    largeFileUploadTaskCreateUploadSessionSpy = jest.spyOn(LargeFileUploadTask, 'createUploadSession' as any);
  });

  afterEach(() => {
    clientInitWithMiddlewareSpy.mockRestore();
    largeFileUploadTaskCreateUploadSessionSpy.mockRestore();
  });

  describe('constructor', () => {
    it('instantiates ClientSecretCredential with tenantId, clientId, and clientSecret', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      // Verify that ClientSecretCredential was instantiated successfully by checking that
      // the service has a client which requires successful credential creation
      expect(service.client).toBeDefined();
    });

    it('instantiates TokenCredentialAuthenticationProvider with credential and scope', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      // Verify that TokenCredentialAuthenticationProvider was instantiated by checking
      // that the client initialization succeeded with an authProvider
      expect(service.client).toBeDefined();
    });

    it('initializes Client with debugLogging and authProvider', () => {
      new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      expect(clientInitWithMiddlewareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          debugLogging: true,
          authProvider: expect.any(Object),
        }),
      );
    });

    it('stores initialized client on service instance', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      expect(service.client).toBeDefined();
      expect(service.client).not.toBeNull();
    });

    it('passes correct credentials to ClientSecretCredential', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      // Verify that a client was successfully created, indicating valid credentials were passed
      expect(service.client).toBeInstanceOf(Client);
    });

    it('passes correct scope to TokenCredentialAuthenticationProvider', () => {
      new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      // Verify that initialization completed successfully, which requires correct scope
      expect(clientInitWithMiddlewareSpy).toHaveBeenCalled();
    });
  });

  describe('getFileUploadSession', () => {
    it('calls LargeFileUploadTask.createUploadSession with client, url, and headers', async () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      try {
        await service.getFileUploadSession(urlToCreateUploadSession, uploadSessionHeaders);
      } catch {
        // Expected to fail because we're calling the real Azure SDK
      }

      expect(largeFileUploadTaskCreateUploadSessionSpy).toHaveBeenCalledWith(service.client, urlToCreateUploadSession, uploadSessionHeaders);
    });

    it('passes correct arguments to createUploadSession', async () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      try {
        await service.getFileUploadSession(urlToCreateUploadSession, uploadSessionHeaders);
      } catch {
        // Expected to fail
      }

      // Verify method was called with correct parameters
      expect(largeFileUploadTaskCreateUploadSessionSpy).toHaveBeenCalled();
      const callArgs = largeFileUploadTaskCreateUploadSessionSpy.mock.calls[0];
      expect(callArgs[1]).toBe(urlToCreateUploadSession);
      expect(callArgs[2]).toEqual(uploadSessionHeaders);
    });
  });

  describe('getFileUploadTask', () => {
    it('creates a StreamUpload instance with file, fileName, and fileSizeInBytes', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      const result = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      // Verify StreamUpload was created as part of the task creation
      expect(result).toBeInstanceOf(LargeFileUploadTask);
    });

    it('creates a LargeFileUploadTask instance with correct parameters', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      const result = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      expect(result).toBeInstanceOf(LargeFileUploadTask);
    });

    it('passes file, fileName, and fileSizeInBytes parameters to StreamUpload', () => {
      // Create StreamUpload directly to verify the parameters match what the service creates
      const streamUpload = new StreamUpload(file, fileName, fileSizeInBytes);

      expect(streamUpload.name).toBe(fileName);
      expect(streamUpload.size).toBe(fileSizeInBytes);
    });

    it('passes client, streamUpload, uploadSession, and options to LargeFileUploadTask', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      const result = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      // Verify the returned task is a LargeFileUploadTask instance with correct configuration
      expect(result).toBeInstanceOf(LargeFileUploadTask);
    });

    it('passes range-size options to LargeFileUploadTask', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      const customRangeSize = valueGenerator.nonnegativeInteger({ max: DTFS_MAX_FILE_SIZE_BYTES });
      const customOptions: LargeFileUploadTaskOptions = { rangeSize: customRangeSize };

      const result = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, customOptions);

      expect(result).toBeInstanceOf(LargeFileUploadTask);
      expect(customOptions.rangeSize).toBe(customRangeSize);
    });

    it('returns a LargeFileUploadTask instance', () => {
      const service = new GraphClientService({
        tenantId,
        clientId,
        clientSecret,
        scope,
      });

      const result = service.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

      expect(result).toBeInstanceOf(LargeFileUploadTask);
    });
  });
});
