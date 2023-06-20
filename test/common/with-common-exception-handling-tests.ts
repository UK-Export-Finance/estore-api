import { GraphError } from '@microsoft/microsoft-graph-client';
import supertest from 'supertest';

import { commonGraphExceptionTestCases } from './common-graph-exception-handling-test-cases';

export const withCommonGraphExceptionHandlingTests = ({
  givenRequestWouldOtherwiseSucceed,
  givenGraphServiceCallWillThrowError,
  makeRequest,
}: {
  givenRequestWouldOtherwiseSucceed: () => void;
  givenGraphServiceCallWillThrowError: (error: Error) => void;
  makeRequest: () => supertest.Test;
}) => {
  describe('withCommonGraphExceptionHandling', () => {
    const graphStatusCode = 0;
    const graphErrorMessage = 'GraphErrorMessage';

    it.each(commonGraphExceptionTestCases)(
      'returns a $responseStatusCode with message $responseMessage if Microsoft Graph responds with cod $graphErrorCode ',
      async ({ expectedResponseMessage, expectedResponseCode, graphErrorCode }) => {
        const graphError = new GraphError(graphStatusCode, graphErrorMessage);
        graphError.code = graphErrorCode;

        givenRequestWouldOtherwiseSucceed();
        givenGraphServiceCallWillThrowError(graphError);

        const { status, body } = await makeRequest();

        expect(status).toBe(expectedResponseCode);
        expect(body).toStrictEqual({
          statusCode: expectedResponseCode,
          message: expectedResponseMessage,
        });
      },
    );
  });
};
