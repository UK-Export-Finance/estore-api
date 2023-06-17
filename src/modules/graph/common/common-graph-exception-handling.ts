import { GraphError } from '@microsoft/microsoft-graph-client';

import { GraphAuthenticationFailedException } from '../exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '../exception/graph-invalid-request.exception';
import { GraphUnexpectedException } from '../exception/graph-unexpected.exception';

const failedAuth = ['CredentialUnavailableError', 'AuthenticationRequiredError'];
const invalidRequest = ['invalidRequest'];

export const commonGraphExceptionHandling = (error: unknown) => {
  if (!(error instanceof Error)) {
    throw new GraphUnexpectedException('An unexpected error occurred.');
  }

  if (error instanceof GraphError) {
    if (failedAuth.includes(error.code)) {
      throw new GraphAuthenticationFailedException(error.message, error);
    }
    if (invalidRequest.includes(error.code)) {
      throw new GraphInvalidRequestException(error.message, error);
    }
  }

  throw new GraphUnexpectedException(error.message, error);
};
