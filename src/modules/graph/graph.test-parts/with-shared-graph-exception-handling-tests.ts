import { GraphError } from '@microsoft/microsoft-graph-client/lib/src/GraphError';
import { sharedGraphExceptionTestCases } from '@ukef-test/common-test-cases/shared-graph-exception-handling-test-cases';
import { resetAllWhenMocks } from 'jest-when';

import { GraphException } from '../exception/graph.exception';

export const withKnownGraphExceptionHandlingTests = ({
  mockSuccessfulGraphApiCall,
  mockGraphEndpointToErrorWith,
  makeRequest,
}: {
  mockSuccessfulGraphApiCall: () => void;
  mockGraphEndpointToErrorWith: (error: unknown) => void;
  makeRequest: () => Promise<unknown>;
}) => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  describe('Shared Graph Exceptions', () => {
    const errorMessage = 'ErrorMessage';
    const statusCode = 0;

    describe.each(sharedGraphExceptionTestCases)('When a graph error is thrown with code $errorCode', ({ graphErrorCode, expectedError }) => {
      const graphError = new GraphError(statusCode, errorMessage);
      graphError.code = graphErrorCode;
      it(`throws a ${expectedError.name}`, async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(graphError);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(expectedError);
      });

      it(`passes the error message to the ${expectedError.name}`, async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(graphError);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(errorMessage);
      });
    });

    describe('When a non GraphError is thrown', () => {
      const error = new Error(errorMessage);
      it('throws a GraphException', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(GraphException);
      });

      it('passes the error message to the GraphException', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(error);
      });
    });

    describe('When the error is not an instance of Error', () => {
      const error = { notAnError: 'Not an error' };
      it('throws a GraphException', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(GraphException);
      });

      it('throws a GraphException with message "An unexpected error occurred."', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow('An unexpected error occurred.');
      });
    });
  });
};
