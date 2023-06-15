import { GraphAuthenticationFailedException } from '../../exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '../../exception/graph-invalid-request.exception';
import { GraphUnexpectedException } from '../../exception/graph-unexpected.exception';

export const commonGraphExceptionTestCases = [
  { errorCode: 'CredentialUnavailableError', expectedError: GraphAuthenticationFailedException },
  { errorCode: 'AuthenticationRequiredError', expectedError: GraphAuthenticationFailedException },
  { errorCode: 'invalidRequest', expectedError: GraphInvalidRequestException },
  { errorCode: 'UnexpectedErrorCode', expectedError: GraphUnexpectedException },
];
