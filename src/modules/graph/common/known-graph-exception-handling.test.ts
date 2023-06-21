import { GraphError } from '@microsoft/microsoft-graph-client';
import { knownGraphExceptionTestCases } from '@ukef-test/common-test-cases/known-graph-exception-handling-test-cases';

import { GraphUnexpectedException } from '../exception/graph-unexpected.exception';
import { knownGraphExceptionHandling } from './known-graph-exception-handling';

describe('knownGraphExceptionHandling', () => {
  const errorMessage = 'ErrorMessage';
  const statusCode = 0;

  describe.each(knownGraphExceptionTestCases)('When a graph error is thrown with code $graphErrorCode', ({ graphErrorCode, expectedError }) => {
    const graphError = new GraphError(statusCode, errorMessage);
    graphError.code = graphErrorCode;

    it(`throws a ${expectedError.name}`, () => {
      expect(() => knownGraphExceptionHandling(graphError)).toThrow(expectedError);
    });

    it(`passes the error message to the ${expectedError.name}`, () => {
      expect(() => knownGraphExceptionHandling(graphError)).toThrow(errorMessage);
    });
  });

  describe('When a non GraphError is thrown', () => {
    const error = new Error(errorMessage);

    it('throws a GraphUnexpectedException', () => {
      expect(() => knownGraphExceptionHandling(error)).toThrow(GraphUnexpectedException);
    });

    it('passes the error message to the GraphUnexpectedException', () => {
      expect(() => knownGraphExceptionHandling(error)).toThrow(errorMessage);
    });
  });

  describe('When the error is not an instance of Error', () => {
    const error = { notAnError: 'Not an error' };

    it('throws a GraphUnexpectedException', () => {
      expect(() => knownGraphExceptionHandling(error)).toThrow(GraphUnexpectedException);
    });

    it('throws a GraphUnexpectedException with message "An unexpected error occurred."', () => {
      expect(() => knownGraphExceptionHandling(error)).toThrow('An unexpected error occurred.');
    });
  });
});
