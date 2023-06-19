import { GraphAuthenticationFailedException } from '../../src/modules/graph/exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '../../src/modules/graph/exception/graph-invalid-request.exception';
import { GraphUnexpectedException } from '../../src/modules/graph/exception/graph-unexpected.exception';

export const commonGraphExceptionTestCases = [
  { graphErrorCode: 'CredentialUnavailableError', expectedError: GraphAuthenticationFailedException, expectedResponseCode: 401, expectedResponseMessage: '' },
  { graphErrorCode: 'AuthenticationRequiredError', expectedError: GraphAuthenticationFailedException, expectedResponseCode: 401, expectedResponseMessage: '' },
  { graphErrorCode: 'invalidRequest', expectedError: GraphInvalidRequestException, expectedResponseCode: 400, expectedResponseMessage: '' },
  { graphErrorCode: 'UnexpectedErrorCode', expectedError: GraphUnexpectedException, expectedResponseCode: 500, expectedResponseMessage: '' },
];
