import { ClientSecretCredential } from '@azure/identity';
import { Client, LargeFileUploadSession, LargeFileUploadTask, LargeFileUploadTaskOptions, StreamUpload } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { DTFS_MAX_FILE_SIZE_BYTES } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { resetAllWhenMocks, when } from 'jest-when';
import { Readable } from 'stream';

import GraphClientService from './graph-client.service';

jest.mock('@azure/identity');
jest.mock('@microsoft/microsoft-graph-client');
jest.mock('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

describe('GraphClientService', () => {
  const valueGenerator = new RandomValueGenerator();
  const tenantId = valueGenerator.string();
  const clientId = valueGenerator.string();
  const clientSecret = valueGenerator.string();
  const scope = `openid offline_access ${valueGenerator.httpsUrl()}/.default`;
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

  let clientInitWithMiddleware: jest.Mock;
  let createUploadSession: jest.Mock;

  beforeEach(() => {
    clientInitWithMiddleware = jest.fn();
    createUploadSession = jest.fn();
    Client.initWithMiddleware = clientInitWithMiddleware;
    LargeFileUploadTask.createUploadSession = createUploadSession;
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('constructor', () => {
    it('creates a new ClientSecretCredential with the tenantId, clientId and clientSecret', () => {
      new GraphClientService({ tenantId, clientId, clientSecret, scope });

      expect(ClientSecretCredential).toHaveBeenCalledTimes(1);
      expect(ClientSecretCredential).toHaveBeenCalledWith(tenantId, clientId, clientSecret);
    });

    it('creates a new TokenCredentialAuthenticationProvider with the ClientSecretCredential and scope', () => {
      new GraphClientService({ tenantId, clientId, clientSecret, scope });

      expect(TokenCredentialAuthenticationProvider).toHaveBeenCalledTimes(1);
      expect(TokenCredentialAuthenticationProvider).toHaveBeenCalledWith(expect.any(ClientSecretCredential), { scopes: [scope] });
    });

    it(`sets the 'client' property to a new Client instance created with the TokenCredentialAuthenticationProvider`, () => {
      mockSuccessfulClientCreation();

      const graphClientService = new GraphClientService({ tenantId, clientId, clientSecret, scope });

      expect(clientInitWithMiddleware).toHaveBeenCalledTimes(1);
      expect(graphClientService.client).toStrictEqual({});
    });
  });

  describe('methods', () => {
    let graphClientService;

    beforeEach(() => {
      graphClientService = new GraphClientService({ tenantId, clientId, clientSecret, scope });
    });

    describe('getFileUploadSession', () => {
      it('returns a new LargeFileUploadSession created with the Client', async () => {
        mockSuccessfulCreateUploadSessionCall();

        const result = await graphClientService.getFileUploadSession(urlToCreateUploadSession, uploadSessionHeaders);

        expect(createUploadSession).toHaveBeenCalledTimes(1);
        expect(result).toBe(uploadSession);
      });
    });

    describe('getFileUploadTask', () => {
      it('creates a new StreamUpload with the file, fileName and fileSizeInBytes', () => {
        graphClientService.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

        expect(StreamUpload).toHaveBeenCalledTimes(1);
        expect(StreamUpload).toHaveBeenCalledWith(file, fileName, fileSizeInBytes);
      });

      it('returns a new LargeFileUploadTask created with the Client, StreamUpload and LargeFileUploadSession', () => {
        const result = graphClientService.getFileUploadTask(file, fileName, fileSizeInBytes, uploadSession, uploadTaskOptions);

        expect(LargeFileUploadTask).toHaveBeenCalledTimes(1);
        expect(LargeFileUploadTask).toHaveBeenCalledWith(graphClientService.client, expect.any(StreamUpload), uploadSession, uploadTaskOptions);
        expect(result).toBeInstanceOf(LargeFileUploadTask);
      });
    });

    const mockSuccessfulCreateUploadSessionCall = (): void => {
      when(createUploadSession).calledWith(graphClientService.client, urlToCreateUploadSession, uploadSessionHeaders).mockResolvedValueOnce(uploadSession);
    };
  });

  const mockSuccessfulClientCreation = (): void => {
    when(clientInitWithMiddleware)
      .calledWith({
        debugLogging: true,
        authProvider: expect.any(TokenCredentialAuthenticationProvider),
      })
      .mockReturnValueOnce({} as Client);
  };
});
