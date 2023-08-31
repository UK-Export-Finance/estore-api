import { MockMdmApi } from '@ukef-test/support/mocks/mdm-api.mock';
import request from 'supertest';

interface Options {
  givenTheRequestWouldOtherwiseSucceed: () => void;
  makeRequest: () => request.Test;
  mdmApi: MockMdmApi;
}

export const withMdmNumbersErrorCasesApiTests = ({ givenTheRequestWouldOtherwiseSucceed, makeRequest, mdmApi }: Options) => {
  describe('Mdm Numbers error cases', () => {
    it('returns a 500 error if the Numbers request fails', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      mdmApi.requestGenerateNewNumbersAnyItem().respondsWith(500);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
    });

    it('returns a 500 error if the Numbers request times out', async () => {
      givenTheRequestWouldOtherwiseSucceed();
      mdmApi.requestGenerateNewNumbersAnyItem().timesOutWith(200);

      const { status, body } = await makeRequest();

      expect(status).toBe(500);
      expect(body).toStrictEqual({ statusCode: 500, message: 'Internal server error' });
    });
  });
};
