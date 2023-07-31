import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { buildKeyToRedact } from './build-key-to-redact';
import { logKeysToRedact, LogKeysToRedactOptions } from './log-keys-to-redact';

describe('logKeysToRedact', () => {
  const valueGenerator = new RandomValueGenerator();
  const options: Omit<LogKeysToRedactOptions, 'redactLogs'> = {
    clientRequest: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
    },
    outgoingRequest: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
    },
    incomingResponse: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
      sensitiveHeaders: [valueGenerator.string(), valueGenerator.string()],
    },
    error: {
      logKey: valueGenerator.string(),
      headersLogKey: valueGenerator.string(),
    },
    azureStorageExcessideData: {
      logKey: valueGenerator.string(),
      excessideDataField: valueGenerator.string(),
    },
  };

  describe('when redactLogs is false', () => {
    it('returns an empty array', () => {
      expect(logKeysToRedact({ redactLogs: false, ...options })).toStrictEqual([]);
    });
  });

  describe('when redactLogs is true', () => {
    let result: string[];

    beforeAll(() => {
      result = logKeysToRedact({ redactLogs: true, ...options });
    });

    describe('clientRequest redact log keys checks', () => {
      it('includes the headers of a client request', () => {
        const { logKey, headersLogKey } = options.clientRequest;

        expect(result).toContain(buildKeyToRedact([logKey, headersLogKey]));
      });
    });

    describe('outgoingRequest redact log keys checks', () => {
      it('includes the headers of an outgoing request', () => {
        const { logKey, headersLogKey } = options.outgoingRequest;

        expect(result).toContain(buildKeyToRedact([logKey, headersLogKey]));
      });
    });

    describe('incomingResponse redact log keys checks', () => {
      it('includes all sensitive headers of an incoming response', () => {
        const { logKey, headersLogKey, sensitiveHeaders } = options.incomingResponse;

        expect(result).toContain(buildKeyToRedact([logKey, headersLogKey, sensitiveHeaders[0]]));
        expect(result).toContain(buildKeyToRedact([logKey, headersLogKey, sensitiveHeaders[1]]));
      });
    });

    describe('error redact log keys checks', () => {
      it('includes header key of an error', () => {
        const { logKey, headersLogKey } = options.error;

        expect(result).toContain(buildKeyToRedact([logKey, 'config', headersLogKey]));
      });

      it('includes config of an innerError.config', () => {
        const { logKey } = options.error;

        expect(result).toContain(buildKeyToRedact([logKey, 'innerError', 'config']));
      });

      it('includes header of an innerError.request', () => {
        const { logKey, headersLogKey } = options.error;

        expect(result).toContain(buildKeyToRedact([logKey, 'innerError', 'request', headersLogKey]));
      });

      it('includes header of an innerError.response.request', () => {
        const { logKey, headersLogKey } = options.error;

        expect(result).toContain(buildKeyToRedact([logKey, 'innerError', 'response', 'request', headersLogKey]));
      });

      it('includes header in an options.cause.innerError.request', () => {
        const { logKey, headersLogKey } = options.error;

        expect(result).toContain(buildKeyToRedact([logKey, 'options', 'cause', 'innerError', 'request', headersLogKey]));
      });

      it('includes header in an options.cause.innerError.response.request', () => {
        const { logKey, headersLogKey } = options.error;

        expect(result).toContain(buildKeyToRedact([logKey, 'options', 'cause', 'innerError', 'response', 'request', headersLogKey]));
      });
    });

    describe('azureStorageExcessideData redact log keys checks', () => {
      it('includes excessideDataField in an options.cause.innerError.request', () => {
        const { logKey, excessideDataField } = options.azureStorageExcessideData;

        expect(result).toContain(buildKeyToRedact([logKey, 'options', 'cause', 'innerError', 'request', excessideDataField]));
      });

      it('includes excessideDataField in an options.cause.innerError.response.request', () => {
        const { logKey, excessideDataField } = options.azureStorageExcessideData;

        expect(result).toContain(buildKeyToRedact([logKey, 'options', 'cause', 'innerError', 'response', 'request', excessideDataField]));
      });
    });
  });
});
