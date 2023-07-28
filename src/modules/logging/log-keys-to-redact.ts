import { buildKeyToRedact } from './build-key-to-redact';

export interface LogKeysToRedactOptions {
  redactLogs: boolean;
  clientRequest: {
    logKey: string;
    headersLogKey: string;
  };
  outgoingRequest: {
    logKey: string;
    headersLogKey: string;
  };
  incomingResponse: {
    logKey: string;
    headersLogKey: string;
    sensitiveHeaders: string[];
  };
  error: {
    logKey: string;
    sensitiveChildKeys: string[];
  };
}

export const logKeysToRedact = ({ redactLogs, clientRequest, outgoingRequest, incomingResponse, error }: LogKeysToRedactOptions): string[] => {
  if (!redactLogs) {
    return [];
  }
  const keys = [
    ...getClientRequestLogKeysToRedact(clientRequest),
    ...getOutgoingRequestLogKeysToRedact(outgoingRequest),
    ...getIncomingResponseLogKeysToRedact(incomingResponse),
    ...getErrorLogKeysToRedact(error),
  ];

  return keys;
};

const getClientRequestLogKeysToRedact = ({ logKey, headersLogKey }: LogKeysToRedactOptions['clientRequest']): string[] => {
  // We redact the client request headers as they contain the secret API key that the client uses to authenticate with our API.
  return [buildKeyToRedact([logKey, headersLogKey])];
};

const getOutgoingRequestLogKeysToRedact = ({ logKey, headersLogKey }: LogKeysToRedactOptions['outgoingRequest']): string[] => {
  return [
    // We redact the outgoing request headers as they contain:
    //  - our Basic auth details for MS graph TODO: check this
    //  - our Basic auth details for Custodian TODO: check this
    buildKeyToRedact([logKey, headersLogKey]),
  ];
};

const getIncomingResponseLogKeysToRedact = ({ logKey, headersLogKey, sensitiveHeaders }: LogKeysToRedactOptions['incomingResponse']): string[] => {
  return [
    ...sensitiveHeaders.map((header) => buildKeyToRedact([logKey, headersLogKey, header])),
    // ...sensitiveBodyFields.map((field) => buildKeyToRedact([logKey, bodyLogKey, field])),
  ];
};

const getErrorLogKeysToRedact = ({ logKey, sensitiveChildKeys }: LogKeysToRedactOptions['error']): string[] => {
  const innerErrorKey = 'innerError';
  const causeNestedErrorKey = ['options', 'cause'];
  return sensitiveChildKeys.flatMap((childKey) => [
    buildKeyToRedact([logKey, childKey]),
    // Some errors are wrapped in a new error and logged as the `innerError` field on the new error.
    // Some errors also contain a `cause` field containing a wrapped error.
    // We need to make sure the sensitive child keys are still redacted in these cases.
    buildKeyToRedact([logKey, innerErrorKey, childKey]),
    buildKeyToRedact([logKey, ...causeNestedErrorKey, childKey]),
    buildKeyToRedact([logKey, ...causeNestedErrorKey, innerErrorKey, childKey]),
  ]);
};
