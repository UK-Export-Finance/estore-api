import { GraphAuthenticationFailedException } from './exception/graph-authentication-failed.exception';
import { GraphInvalidRequestException } from './exception/graph-invalid-request.exception';
import { KnownError } from './known-errors';

export type SharedErrors = SharedError[];

type SharedError = KnownError;

const graphAuthenticationFailedError = (): SharedError => ({
  caseInsensitiveSubstringsToFind: ['CredentialUnavailableError', 'AuthenticationRequiredError'],
  throwError: (error: Error) => {
    throw new GraphAuthenticationFailedException(error.message, error);
  },
});

const graphInvalidRequestError = (): SharedError => ({
  caseInsensitiveSubstringsToFind: ['invalidRequest'],
  throwError: (error: Error) => {
    throw new GraphInvalidRequestException(error.message, error);
  },
});

export const sharedErrors: SharedErrors = [graphAuthenticationFailedError(), graphInvalidRequestError()];
