import nock from 'nock';

import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_APIM_MDM_TIMEOUT } from '../environment-variables';

export class MockMdmApi {
  constructor(private readonly nockInstance: typeof nock) {}

  requestGenerateNewNumbers(requestBodyMatcher: nock.RequestBodyMatcher): MdmApiRequestInterceptor {
    const scope = this.nockMdmRequest();
    return this.buildNumbersRequestInterceptor(scope, requestBodyMatcher);
  }

  requestGenerateNewNumbersAnyItem(): MdmApiRequestInterceptor {
    const requestBodyPlaceholder = '*';
    const scope = this.nockMdmRequest().filteringRequestBody(() => requestBodyPlaceholder);
    return this.buildNumbersRequestInterceptor(scope, requestBodyPlaceholder);
  }

  private nockMdmRequest(): nock.Scope {
    return this.nockInstance(ENVIRONMENT_VARIABLES.APIM_MDM_URL);
  }

  private buildNumbersRequestInterceptor(scope: nock.Scope, requestBodyMatcher: nock.RequestBodyMatcher): MdmApiRequestInterceptor {
    const interceptor = scope
      .post('/numbers', requestBodyMatcher)
      .matchHeader(ENVIRONMENT_VARIABLES.APIM_MDM_KEY, ENVIRONMENT_VARIABLES.APIM_MDM_VALUE)
      .matchHeader('Content-Type', 'application/json');
    return new MdmApiRequestInterceptor(interceptor);
  }
}

class MdmApiRequestInterceptor {
  constructor(private readonly nockInterceptor: nock.Interceptor) {}

  respondsWith(responseCode: number, responseBody?: nock.Body): nock.Scope {
    return this.nockInterceptor.reply(responseCode, responseBody);
  }

  timesOutWith(responseCode: number, responseBody?: nock.Body): nock.Scope {
    return this.nockInterceptor.delay(TIME_EXCEEDING_APIM_MDM_TIMEOUT).reply(responseCode, responseBody);
  }
}
