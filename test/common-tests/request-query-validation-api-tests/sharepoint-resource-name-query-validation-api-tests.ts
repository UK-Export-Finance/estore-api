import { SHAREPOINT } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringQueryValidationApiTestOptions, withStringQueryValidationApiTests } from './string-query-validation-api-tests';

interface SharepointResourceNameQueryValidationApiTestOptions<
  RequestQueryItems extends Record<SharepointResourceNameQueryName, string>,
  SharepointResourceNameQueryName extends keyof any,
> extends Pick<
    StringQueryValidationApiTestOptions<RequestQueryItems, SharepointResourceNameQueryName>,
    'queryName' | 'validRequestQueries' | 'makeRequestWithQueries' | 'givenAnyRequestQueryWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withSharepointResourceNameQueryValidationApiTests = <
  RequestQueryItems extends Record<SharepointResourceNameQueryName, string>,
  SharepointResourceNameQueryName extends keyof any,
>({
  queryName,
  valueGenerator,
  validRequestQueries,
  makeRequestWithQueries,
  givenAnyRequestQueryWouldSucceed,
}: SharepointResourceNameQueryValidationApiTestOptions<RequestQueryItems, SharepointResourceNameQueryName>): void =>
  withStringQueryValidationApiTests<RequestQueryItems, SharepointResourceNameQueryName>({
    queryName,
    minLength: 1,
    maxLength: 250,
    pattern: SHAREPOINT.RESOURCE_NAME.REGEX,
    generateQueryValueOfLength: (length: number) => valueGenerator.word({ length }) as RequestQueryItems[SharepointResourceNameQueryName],
    generateQueryValueThatDoesNotMatchRegex: () => '£Word' as RequestQueryItems[SharepointResourceNameQueryName],
    validRequestQueries,
    makeRequestWithQueries,
    givenAnyRequestQueryWouldSucceed,
  });
