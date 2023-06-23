import { GraphError } from '@microsoft/microsoft-graph-client';
import { sharedGraphExceptionTestCases } from '@ukef-test/common-test-cases/shared-graph-exception-handling-test-cases';
import supertest from 'supertest';

export const withSharedGraphExceptionHandlingTests = ({
  givenRequestWouldOtherwiseSucceed,
  givenGraphServiceCallWillThrowError,
  makeRequest,
}: {
  givenRequestWouldOtherwiseSucceed: () => void;
  givenGraphServiceCallWillThrowError: (error: Error) => void;
  makeRequest: () => supertest.Test;
}) => {
  describe('Handles shared Microsoft Graph exceptions', () => {
    const graphStatusCode = 0;
    const graphErrorMessage = 'GraphErrorMessage';

    it.each(sharedGraphExceptionTestCases)(
      'returns a 500 with message "Internal server error" if Microsoft Graph responds with code $graphErrorCode',
      async ({ graphErrorCode }) => {
        const graphError = new GraphError(graphStatusCode, graphErrorMessage);
        graphError.code = graphErrorCode;

        givenRequestWouldOtherwiseSucceed();
        givenGraphServiceCallWillThrowError(graphError);

        const { status, body } = await makeRequest();

        expect(status).toBe(500);
        expect(body).toStrictEqual({
          statusCode: 500,
          message: 'Internal server error',
        });
      },
    );
  });
};
