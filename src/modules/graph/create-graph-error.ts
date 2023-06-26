import { GraphError } from '@microsoft/microsoft-graph-client';

import { GraphException } from './exception/graph.exception';
import { KnownErrors } from './known-errors';
import { sharedErrors } from './shared-errors';

export const createGraphError = ({
  error,
  messageForUnknownError,
  knownErrors,
}: {
  error: unknown;
  messageForUnknownError: string;
  knownErrors: KnownErrors;
}) => {
  const knownAndSharedErrors = [...knownErrors, ...sharedErrors];

  if (!(error instanceof Error)) {
    throw new GraphException(messageForUnknownError);
  }

  if (error instanceof GraphError && error.code) {
    const errorMessageInLowerCase = error.message.toLowerCase();
    const errorCodeInLowerCase = error.code.toLowerCase();
    knownAndSharedErrors.forEach(({ caseInsensitiveSubstringsToFind, throwError }) => {
      caseInsensitiveSubstringsToFind.forEach((substringToFind) => {
        if (errorMessageInLowerCase.includes(substringToFind.toLowerCase()) || errorCodeInLowerCase.includes(substringToFind.toLowerCase())) {
          return throwError(error);
        }
      });
    });
  }
  throw new GraphException(error.message, error);
};
