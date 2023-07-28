import { UKEFID } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { ParamValidationApiTestOptions, withParamValidationApiTests } from './string-param-validation-api-tests';

interface Options extends Pick<ParamValidationApiTestOptions, 'validRequestParam' | 'makeRequest' | 'givenAnyRequestParamWouldSucceed' | 'successStatusCode'> {
  valueGenerator: RandomValueGenerator;
}

export const withDealIdParamValidationApiTests = ({
  valueGenerator,
  validRequestParam,
  makeRequest,
  givenAnyRequestParamWouldSucceed,
  successStatusCode,
}: Options): void =>
  withParamValidationApiTests({
    paramName: 'dealId',
    length: 10,
    generateParamValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
    pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
    generateParamValueThatDoesNotMatchRegex: () => '0123456789',
    validRequestParam,
    makeRequest,
    givenAnyRequestParamWouldSucceed,
    successStatusCode,
  });
