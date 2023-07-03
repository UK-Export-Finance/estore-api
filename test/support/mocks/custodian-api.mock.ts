import nock from 'nock';

import { ENVIRONMENT_VARIABLES, TIME_EXCEEDING_CUSTODIAN_TIMEOUT } from '../environment-variables';

export class MockCustodianApi {
  constructor(private readonly nockInstance: typeof nock) {}

  requestToCreateAndProvisionItem(requestBodyMatcher: nock.RequestBodyMatcher): CustodianApiRequestInterceptor {
    const scope = this.nockCustodianRequest();
    return this.buildCreateAndProvisionRequestInterceptor(scope, requestBodyMatcher);
  }

  requestToCreateAndProvisionAnyItem(): CustodianApiRequestInterceptor {
    const requestBodyPlaceholder = '*';
    const scope = this.nockCustodianRequest().filteringRequestBody(() => requestBodyPlaceholder);
    return this.buildCreateAndProvisionRequestInterceptor(scope, requestBodyPlaceholder);
  }

  private nockCustodianRequest(): nock.Scope {
    return this.nockInstance(ENVIRONMENT_VARIABLES.CUSTODIAN_BASE_URL);
  }

  private buildCreateAndProvisionRequestInterceptor(scope: nock.Scope, requestBodyMatcher: nock.RequestBodyMatcher): CustodianApiRequestInterceptor {
    const interceptor = scope
      .post('/Create/CreateAndProvision', requestBodyMatcher)
      .matchHeader(ENVIRONMENT_VARIABLES.CUSTODIAN_API_KEY_HEADER_NAME, ENVIRONMENT_VARIABLES.CUSTODIAN_API_KEY_HEADER_VALUE)
      .matchHeader('Accept', 'application/json')
      .matchHeader('Content-Type', 'application/json');
    return new CustodianApiRequestInterceptor(interceptor);
  }
}

class CustodianApiRequestInterceptor {
  constructor(private readonly nockInterceptor: nock.Interceptor) {}

  respondsWith(responseCode: number, responseBody?: nock.Body): nock.Scope {
    return this.nockInterceptor.reply(responseCode, responseBody);
  }

  timesOutWith(responseCode: number, responseBody?: nock.Body): nock.Scope {
    return this.nockInterceptor.delay(TIME_EXCEEDING_CUSTODIAN_TIMEOUT).reply(responseCode, responseBody);
  }
}
