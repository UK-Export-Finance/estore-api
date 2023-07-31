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
    headersLogKey: string;
  };
  azureStorageExcessideData: {
    logKey: string;
    excessideDataField: string;
  };
}

export const logKeysToRedact = ({
  redactLogs,
  clientRequest,
  outgoingRequest,
  incomingResponse,
  error,
  azureStorageExcessideData,
}: LogKeysToRedactOptions): string[] => {
  if (!redactLogs) {
    return [];
  }
  const keys = [
    ...getClientRequestLogKeysToRedact(clientRequest),
    ...getOutgoingRequestLogKeysToRedact(outgoingRequest),
    ...getIncomingResponseLogKeysToRedact(incomingResponse),
    ...getErrorLogKeysToRedact(error),
    ...getAzureStorageExcessideDataLogKeysToRedact(azureStorageExcessideData),
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
    //  - our APIM key for MDM API
    //  - our Azure container key for Estore API
    //  - our Custodian API key
    buildKeyToRedact([logKey, headersLogKey]),
  ];
};

const getIncomingResponseLogKeysToRedact = ({ logKey, headersLogKey, sensitiveHeaders }: LogKeysToRedactOptions['incomingResponse']): string[] => {
  // We redact the incoming response headers as they contain set cookies from Custodian, but it's no session there.
  return [...sensitiveHeaders.map((header) => buildKeyToRedact([logKey, headersLogKey, header]))];
};

const getErrorLogKeysToRedact = ({ logKey, headersLogKey }: LogKeysToRedactOptions['error']): string[] => {
  const innerErrorKey = 'innerError';
  const requestKey = 'request';
  const responseKey = 'response';
  const configKey = 'config';
  const causeNestedErrorKey = ['options', 'cause'];
  const headersInRequestNestedKey = [innerErrorKey, requestKey, headersLogKey];
  const headersInResponseRequestNestedKey = [innerErrorKey, responseKey, requestKey, headersLogKey];
  return [
    buildKeyToRedact([logKey, configKey, headersLogKey]),
    buildKeyToRedact([logKey, innerErrorKey, configKey]),
    buildKeyToRedact([logKey, ...headersInRequestNestedKey]),
    buildKeyToRedact([logKey, ...headersInResponseRequestNestedKey]),
    buildKeyToRedact([logKey, ...causeNestedErrorKey, ...headersInRequestNestedKey]),
    buildKeyToRedact([logKey, ...causeNestedErrorKey, ...headersInResponseRequestNestedKey]),
  ];
};

const getAzureStorageExcessideDataLogKeysToRedact = ({ logKey, excessideDataField }: LogKeysToRedactOptions['azureStorageExcessideData']): string[] => {
  const innerErrorKey = 'innerError';
  const requestKey = 'request';
  const responseKey = 'response';
  const causeNestedErrorKey = ['options', 'cause'];
  const excessideDataInRequestNestedKey = [innerErrorKey, requestKey, excessideDataField];
  const excessideDataInResponseRequestNestedKey = [innerErrorKey, responseKey, requestKey, excessideDataField];
  return [
    buildKeyToRedact([logKey, ...causeNestedErrorKey, ...excessideDataInRequestNestedKey]),
    buildKeyToRedact([logKey, ...causeNestedErrorKey, ...excessideDataInResponseRequestNestedKey]),
  ];
};
