import { MockCustodianApi } from '@ukef-test/support/mocks/custodian-api.mock';
import request from 'supertest';

interface Options {
  givenTheRequestWouldOtherwiseSucceed: () => void;
  makeRequest: () => request.Test;
  custodianApi: MockCustodianApi;
}

export const withCustodianErrorCasesApiTests = ({ givenTheRequestWouldOtherwiseSucceed, makeRequest, custodianApi }: Options) => {
  describe('Custodian CreateAndProvision error cases', () => {
    it('returns a 500 error if the CreateAndProvision request fails', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      custodianApi.requestToCreateAndProvisionAnyItem().respondsWith(500);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
    });

    it('returns a 500 error if the CreateAndProvision request times out', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      custodianApi.requestToCreateAndProvisionAnyItem().timesOutWith(200);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
    });
  });

  describe('Custodian ProvisioningJobsByRequestId error cases', () => {
    it('returns a 500 error if the ProvisioningJobsByRequestId request fails', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      custodianApi.requestToReadJobsByAnyRequestId().respondsWith(500);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
    });

    it('returns a 500 error if the ProvisioningJobsByRequestId request times out', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      custodianApi.requestToReadJobsByAnyRequestId().timesOutWith(200);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
    });
  });
};
