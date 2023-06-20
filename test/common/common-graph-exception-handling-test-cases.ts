import { GraphAuthenticationFailedException } from '../../src/modules/graph/exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '../../src/modules/graph/exception/graph-invalid-request.exception';
import { GraphUnexpectedException } from '../../src/modules/graph/exception/graph-unexpected.exception';

export const commonGraphExceptionTestCases = [
  { graphErrorCode: 'CredentialUnavailableError', expectedError: GraphAuthenticationFailedException, expectedResponseCode: 500, expectedResponseMessage: 'Internal server error' },
  { graphErrorCode: 'AuthenticationRequiredError', expectedError: GraphAuthenticationFailedException, expectedResponseCode: 500, expectedResponseMessage: 'Internal server error' },
  { graphErrorCode: 'invalidRequest', expectedError: GraphInvalidRequestException, expectedResponseCode: 500, expectedResponseMessage: 'Internal server error' },
  { graphErrorCode: 'UnexpectedErrorCode', expectedError: GraphUnexpectedException, expectedResponseCode: 500, expectedResponseMessage: 'Internal server error' },
];
