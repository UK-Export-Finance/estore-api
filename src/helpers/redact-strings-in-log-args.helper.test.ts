import { REDACT_STRING_PATHS } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { redactStringsInLogArgs } from './redact-strings-in-log-args.helper';

describe('Redact errors helper', () => {
  const valueGenerator = new RandomValueGenerator();

  describe('redactStringsInLogArgs', () => {
    const domain = valueGenerator.httpsUrl();
    const otherSensitiveField = valueGenerator.word();
    const message = `ConnectionError: Failed to connect to ${domain}, ${otherSensitiveField}`;
    const redactedMessage = `ConnectionError: Failed to connect to [RedactedDomain], [Redacted]`;
    const redactStrings = [
      { searchValue: domain, replaceValue: '[RedactedDomain]' },
      { searchValue: otherSensitiveField, replaceValue: '[Redacted]' },
    ];

    const args = [
      {
        message: message,
        stack: message,
        err: {
          message: message,
          stack: message,
          safe: 'Nothing sensitive',
          innerError: {
            message: message,
            stack: message,
            body: message,
          },
        },
        incomingResponse: {
          data: {
            ExceptionMessage: message,
            safe: 'Nothing sensitive',
          },
        },
      },
    ];
    const expectedResult = [
      {
        message: redactedMessage,
        stack: redactedMessage,
        err: {
          message: redactedMessage,
          stack: redactedMessage,
          safe: 'Nothing sensitive',
          innerError: {
            message: redactedMessage,
            stack: redactedMessage,
            body: redactedMessage,
          },
        },
        incomingResponse: {
          data: {
            ExceptionMessage: redactedMessage,
            safe: 'Nothing sensitive',
          },
        },
      },
    ];

    it('replaces sensitive data in input object', () => {
      const redacted = redactStringsInLogArgs(true, REDACT_STRING_PATHS, redactStrings, args);

      expect(redacted).toStrictEqual(expectedResult);
    });

    it('returns original input if redactLogs is set to false', () => {
      const redacted = redactStringsInLogArgs(false, REDACT_STRING_PATHS, redactStrings, args);

      expect(redacted).toStrictEqual(args);
    });

    it('replaces sensitive data in input object using regex', () => {
      const redactStrings = [{ searchValue: /(Login failed for user ').*(')/g, replaceValue: '$1[Redacted]$2' }];
      const otherSensitiveValue = valueGenerator.word();
      const messageforRegex = `Connection error: Login failed for user '${otherSensitiveValue}'`;
      const redactedMessage = `Connection error: Login failed for user '[Redacted]'`;
      const args = [
        {
          message: messageforRegex,
          stack: messageforRegex,
          err: {
            message: messageforRegex,
          },
        },
      ];
      const expectedResult = [
        {
          message: redactedMessage,
          stack: redactedMessage,
          err: {
            message: redactedMessage,
          },
        },
      ];

      const redacted = redactStringsInLogArgs(true, REDACT_STRING_PATHS, redactStrings, args);

      expect(redacted).toStrictEqual(expectedResult);
    });

    it('replaces sensitive data in different input object', () => {
      const args = [
        {
          field1: message,
          field2: {
            field3: message,
            safe: 'Nothing sensitive',
          },
        },
      ];
      const expectedResult = [
        {
          field1: redactedMessage,
          field2: {
            field3: redactedMessage,
            safe: 'Nothing sensitive',
          },
        },
      ];
      const redactPaths = ['field1', 'field2.field3'];
      const redacted = redactStringsInLogArgs(true, redactPaths, redactStrings, args);

      expect(redacted).toStrictEqual(expectedResult);
    });

    it.each(['__proto__.message', 'constructor.prototype.message', 'err.__proto__.message', 'err.constructor.prototype.message', 'prototype.message'])(
      'ignores unsafe path %s',
      (path) => {
        const prototype = { message };
        const arg = Object.create(prototype);
        arg.err = Object.create(prototype);
        arg.prototype = { message };

        redactStringsInLogArgs(true, [path], redactStrings, [arg]);

        expect(prototype.message).toBe(message);
        expect(arg.prototype.message).toBe(message);
        expect(Object.hasOwn(arg, 'message')).toBe(false);
        expect(Object.hasOwn(arg.err, 'message')).toBe(false);
      },
    );

    it('does not traverse inherited objects at otherwise safe paths', () => {
      const inheritedError = { message };
      const arg = Object.create({ err: inheritedError });

      redactStringsInLogArgs(true, ['err.message'], redactStrings, [arg]);

      expect(inheritedError.message).toBe(message);
      expect(Object.hasOwn(arg, 'err')).toBe(false);
    });

    it('redacts Error properties without changing their descriptors', () => {
      const error = new Error(message);
      const descriptor = Object.getOwnPropertyDescriptor(error, 'message');

      redactStringsInLogArgs(true, ['message'], redactStrings, [error]);

      expect(error.message).toBe(redactedMessage);
      expect(Object.getOwnPropertyDescriptor(error, 'message')).toStrictEqual({ ...descriptor, value: redactedMessage });
    });

    it('leaves missing and non-string values unchanged', () => {
      const args = [null, undefined, { err: null }, { message: 42 }, { message: '' }, {}];

      redactStringsInLogArgs(true, ['message', 'err.message'], redactStrings, args);

      expect(args).toStrictEqual([null, undefined, { err: null }, { message: 42 }, { message: '' }, {}]);
    });

    it('does not apply empty search strings to empty values', () => {
      const args = [{ message: '' }];

      redactStringsInLogArgs(true, ['message'], [{ searchValue: '', replaceValue: '[Redacted]' }], args);

      expect(args).toStrictEqual([{ message: '' }]);
    });
  });
});
