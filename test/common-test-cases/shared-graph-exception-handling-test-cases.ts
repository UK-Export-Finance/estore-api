import { GraphAuthenticationFailedException } from '@ukef/modules/graph/exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '@ukef/modules/graph/exception/graph-invalid-request.exception';

export const sharedGraphExceptionTestCases = [
  {
    graphErrorCode: 'CredentialUnavailableError',
    expectedError: GraphAuthenticationFailedException,
  },
  {
    graphErrorCode: 'AuthenticationRequiredError',
    expectedError: GraphAuthenticationFailedException,
  },
  {
    graphErrorCode: 'invalidRequest',
    expectedError: GraphInvalidRequestException,
  },
];
