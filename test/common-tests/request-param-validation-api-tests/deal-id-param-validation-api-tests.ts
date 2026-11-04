import { REGEX } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { ParamValidationApiTestOptions, withParamValidationApiTests } from './string-param-validation-api-tests';

type Options = Pick<ParamValidationApiTestOptions, 'validRequestParam' | 'makeRequest' | 'givenAnyRequestParamWouldSucceed' | 'successStatusCode'> & {
  valueGenerator: RandomValueGenerator;
};

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
    pattern: REGEX.UKEF_ID_TEN_DIGIT,
    generateParamValueThatDoesNotMatchRegex: () => '0123456789',
    validRequestParam,
    makeRequest,
    givenAnyRequestParamWouldSucceed,
    successStatusCode,
  });
