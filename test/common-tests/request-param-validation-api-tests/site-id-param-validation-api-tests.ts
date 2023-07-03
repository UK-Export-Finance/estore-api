import { UKEFID } from '@ukef/constants';
import { UkefSiteId } from '@ukef/helpers';
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
    length: 8,
    pattern: UKEFID.SITE_ID.REGEX,
    generateParamValueOfLength: (length: number) => valueGenerator.ukefSiteId(length - 4),
    generateParamValueThatDoesNotMatchRegex: () => '00000000' as UkefSiteId,
    validRequestParam,
    makeRequest,
    givenAnyRequestParamWouldSucceed,
    successStatusCode,
  });
