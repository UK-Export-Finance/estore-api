import { jest } from '@jest/globals';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { filterAxiosResponseForLogging } from './filter-axios-response-for-logging.helper';
import { INCOMING_RESPONSE_LOG_KEY } from './http.constants';
import { logAxiosResponseErrorWith } from './log-axios-response-error.axios-interceptor';
import { AxiosResponseErrorInterceptor } from './type/axios-response-error-interceptor.type';

describe('logAxiosResponseError', () => {
  const valueGenerator = new RandomValueGenerator();

  const data = {
    someNumber: valueGenerator.nonnegativeFloat(),
  };
  const headers = { Accept: 'application/json' };
  const status = 200;
  const statusText = 'ok';

  const response: AxiosResponse = {
    data,
    headers,
    status,
    statusText,
    config: {} as InternalAxiosRequestConfig,
    request: {},
  };

  const errorWithoutResponse = new AxiosError('error without response');

  const errorWithResponse = new AxiosError('error with response', undefined, undefined, undefined, response);

  let logger: PinoLogger;
  let logAxiosResponseError: AxiosResponseErrorInterceptor;

  beforeEach(() => {
    logger = new PinoLogger({});
    logger.warn = jest.fn();
    logAxiosResponseError = logAxiosResponseErrorWith(logger);
  });

  describe('when the error does not include a response', () => {
    it('logs the full error at warn level', async () => {
      await logAxiosResponseError(errorWithoutResponse).catch(() => {});

      expect(logger.warn).toHaveBeenCalledWith(errorWithoutResponse, 'A HTTP server failed to respond to our request.');
    });

    it('rejects with the original error', async () => {
      const logAxiosResponseErrorPromise = logAxiosResponseError(errorWithoutResponse);

      await expect(logAxiosResponseErrorPromise).rejects.toBe(errorWithoutResponse);
    });
  });

  describe('when the error does include a response', () => {
    it('logs the filtered response at warn level using key INCOMING_RESPONSE_LOG_KEY', async () => {
      await logAxiosResponseError(errorWithResponse).catch(() => {});

      const filteredResponse = filterAxiosResponseForLogging(response);
      expect(logger.warn).toHaveBeenCalledWith(
        { [INCOMING_RESPONSE_LOG_KEY]: filteredResponse },
        'A HTTP server responded to our request with an error response.',
      );
    });

    it('rejects with the original error', async () => {
      const logAxiosResponseErrorPromise = logAxiosResponseError(errorWithResponse);

      await expect(logAxiosResponseErrorPromise).rejects.toBe(errorWithResponse);
    });
  });
});
