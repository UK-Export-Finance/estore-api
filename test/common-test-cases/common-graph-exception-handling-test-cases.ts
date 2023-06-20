import { GraphAuthenticationFailedException } from '@ukef/modules/graph/exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '@ukef/modules/graph/exception/graph-invalid-request.exception';
import { GraphUnexpectedException } from '@ukef/modules/graph/exception/graph-unexpected.exception';

export const commonGraphExceptionTestCases = [
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
  {
    graphErrorCode: 'UnexpectedErrorCode',
    expectedError: GraphUnexpectedException,
  },
];
