import { SHAREPOINT } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { ParamValidationApiTestOptions, withParamValidationApiTests } from './string-param-validation-api-tests';

interface Options extends Pick<ParamValidationApiTestOptions, 'validRequestParam' | 'makeRequest' | 'givenAnyRequestParamWouldSucceed' | 'successStatusCode'> {
  valueGenerator: RandomValueGenerator;
}

export const withSiteIdParamValidationApiTests = ({
  valueGenerator,
  validRequestParam,
  makeRequest,
  givenAnyRequestParamWouldSucceed,
  successStatusCode,
}: Options): void =>
  withParamValidationApiTests({
    paramName: 'siteId',
    minLength: 1,
    pattern: SHAREPOINT.CASE_SITE_URL.REGEX,
    generateParamValueOfLength: (length: number) => valueGenerator.word({ length }),
    validRequestParam,
    makeRequest,
    givenAnyRequestParamWouldSucceed,
    successStatusCode,
  });
