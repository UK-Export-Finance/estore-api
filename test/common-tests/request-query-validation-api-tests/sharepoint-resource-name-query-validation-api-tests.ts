import { REGEX } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringQueryValidationApiTestOptions, withStringQueryValidationApiTests } from './string-query-validation-api-tests';

type SharepointResourceNameQueryValidationApiTestOptions<
  RequestQueryItems extends Record<SharepointResourceNameQueryName, string>,
  SharepointResourceNameQueryName extends keyof any,
> = Pick<
  StringQueryValidationApiTestOptions<RequestQueryItems, SharepointResourceNameQueryName>,
  'queryName' | 'validRequestQueries' | 'successStatusCode' | 'makeRequestWithQueries' | 'givenAnyRequestQueryWouldSucceed'
> & {
  valueGenerator: RandomValueGenerator;
};

export const withSharepointResourceNameQueryValidationApiTests = <
  RequestQueryItems extends Record<SharepointResourceNameQueryName, string>,
  SharepointResourceNameQueryName extends keyof any,
>({
  queryName,
  valueGenerator,
  validRequestQueries,
  successStatusCode,
  makeRequestWithQueries,
  givenAnyRequestQueryWouldSucceed,
}: SharepointResourceNameQueryValidationApiTestOptions<RequestQueryItems, SharepointResourceNameQueryName>): void =>
  withStringQueryValidationApiTests<RequestQueryItems, SharepointResourceNameQueryName>({
    queryName,
    minLength: 1,
    maxLength: 250,
    pattern: REGEX.SHAREPOINT_RESOURCE_NAME,
    generateQueryValueOfLength: (length: number) => valueGenerator.word({ length }) as RequestQueryItems[SharepointResourceNameQueryName],
    generateQueryValueThatDoesNotMatchRegex: () => '£Word' as RequestQueryItems[SharepointResourceNameQueryName],
    validRequestQueries,
    successStatusCode,
    makeRequestWithQueries,
    givenAnyRequestQueryWouldSucceed,
  });
