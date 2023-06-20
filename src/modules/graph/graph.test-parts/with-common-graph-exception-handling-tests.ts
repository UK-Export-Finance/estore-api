import { GraphError } from '@microsoft/microsoft-graph-client/lib/src/GraphError';

import { commonGraphExceptionTestCases } from '../common/test-parts/common-graph-exception-handling-test-parts';
import { GraphUnexpectedException } from '../exception/graph-unexpected.exception';

export const withCommonGraphExceptionHandlingTests = ({
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
  });

  describe('Common Graph Exceptions', () => {
    const errorMessage = 'ErrorMessage';
    const statusCode = 0;

    describe.each(commonGraphExceptionTestCases)('When a graph error is thrown with code $errorCode', ({ errorCode, expectedError }) => {
      const graphError = new GraphError(statusCode, errorMessage);
      graphError.code = errorCode;
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
      it('throws a GraphUnexpectedException', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(GraphUnexpectedException);
      });

      it('passes the error message to the GraphUnexpectedException', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(errorMessage);
      });
    });

    describe('When the error is not an instance of Error', () => {
      const error = { notAnError: 'Not an error' };
      it('throws a GraphUnexpectedException', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow(GraphUnexpectedException);
      });

      it('throws a GraphUnexpectedException with message "An unexpected error occurred."', async () => {
        mockSuccessfulGraphApiCall();
        mockGraphEndpointToErrorWith(error);

        const errorPromise = makeRequest();

        await expect(errorPromise).rejects.toThrow('An unexpected error occurred.');
      });
    });
  });
};