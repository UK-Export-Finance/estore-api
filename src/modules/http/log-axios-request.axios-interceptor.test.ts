import { jest } from '@jest/globals';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { PinoLogger } from 'nestjs-pino';

import { filterAxiosRequestForLogging } from './filter-axios-request-for-logging.helper';
import { OUTGOING_REQUEST_LOG_KEY } from './http.constants';
import { logAxiosRequestWith } from './log-axios-request.axios-interceptor';
import { AxiosRequestInterceptor } from './type/axios-request-interceptor.type';

describe('logAxiosRequest', () => {
  const valueGenerator = new RandomValueGenerator();

  const timeout = valueGenerator.nonnegativeInteger();
  const baseURL = valueGenerator.httpsUrl();
  const data = {
    someNumber: valueGenerator.nonnegativeFloat(),
  };

  const request: InternalAxiosRequestConfig = {
    timeout,
    baseURL,
    headers: new AxiosHeaders(),
    data,
  };

  let logger: PinoLogger;
  let logAxiosRequest: AxiosRequestInterceptor;

  beforeEach(() => {
    logger = new PinoLogger({});
    logger.debug = jest.fn();
    logAxiosRequest = logAxiosRequestWith(logger);
  });

  it('logs the filtered request at debug level using key OUTGOING_REQUEST_LOG_KEY', () => {
    logAxiosRequest(request);

    const filteredRequest = filterAxiosRequestForLogging(request);
    expect(logger.debug).toHaveBeenCalledWith({ [OUTGOING_REQUEST_LOG_KEY]: filteredRequest }, 'Sending the following HTTP request.');
  });

  it('returns the original request', () => {
    expect(logAxiosRequest(request)).toBe(request);
  });
});
