import { GraphError } from '@microsoft/microsoft-graph-client';

import { GraphUnexpectedException } from '../exception/graph-unexpected.exception';
import { commonGraphExceptionHandling } from './common-graph-exception-handling';
import { commonGraphExceptionTestCases } from './test-parts/common-graph-exception-handling-test-parts';

describe('commonGraphExceptionHandling', () => {
  const errorMessage = 'ErrorMessage';
  const statusCode = 0;

  describe.each(commonGraphExceptionTestCases)('When a graph error is thrown with code $errorCode', ({ errorCode, expectedError }) => {
    const graphError = new GraphError(statusCode, errorMessage);
    graphError.code = errorCode;

    it(`throws a ${expectedError.name}`, () => {
      expect(() => commonGraphExceptionHandling(graphError)).toThrow(expectedError);
    });

    it(`passes the error message to the ${expectedError.name}`, () => {
      expect(() => commonGraphExceptionHandling(graphError)).toThrow(errorMessage);
    });
  });

  describe('When a non GraphError is thrown', () => {
    const error = new Error(errorMessage);

    it('throws a GraphUnexpectedException', () => {
      expect(() => commonGraphExceptionHandling(error)).toThrow(GraphUnexpectedException);
    });

    it('passes the error message to the GraphUnexpectedException', () => {
      expect(() => commonGraphExceptionHandling(error)).toThrow(errorMessage);
    });
  });

  describe('When the error is not an instance of Error', () => {
    const error = { notAnError: 'Not an error' };

    it('throws a GraphUnexpectedException', () => {
      expect(() => commonGraphExceptionHandling(error)).toThrow(GraphUnexpectedException);
    });

    it('throws a GraphUnexpectedException with message "An unexpected error occurred."', () => {
      expect(() => commonGraphExceptionHandling(error)).toThrow('An unexpected error occurred.');
    });
  });
});
