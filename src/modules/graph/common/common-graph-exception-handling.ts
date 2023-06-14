import { GraphError } from '@microsoft/microsoft-graph-client';

import { GraphAuthenticationFailedException } from '../exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from '../exception/graph-invalid-request.exception';
import { GraphUnexpectedException } from '../exception/graph-unexpected.exception';

export const commonGraphExceptionHandling = (error: unknown) => {
  if (error instanceof GraphError) {
    if (error.code === 'CredentialUnavailableError' || error.code === 'AuthenticationRequiredError') {
      throw new GraphAuthenticationFailedException(error.message, error);
    }
    if ((error.code = 'invalidRequest')) {
      throw new GraphInvalidRequestException(error.message, error);
    }
    throw new GraphUnexpectedException(error.message, error);
  }
  throw new Error();
};
