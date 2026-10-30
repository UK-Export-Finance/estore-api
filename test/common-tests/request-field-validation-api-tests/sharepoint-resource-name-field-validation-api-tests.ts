import { REGEX } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type SharepointResourceNameFieldValidationApiTestOptions<
  RequestBodyItem extends Record<SharepointResourceNameFieldName, string>,
  SharepointResourceNameFieldName extends keyof any,
> = Pick<
  StringFieldValidationApiTestOptions<RequestBodyItem, SharepointResourceNameFieldName>,
  'fieldName' | 'validRequestBody' | 'successStatusCode' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
> & {
  valueGenerator: RandomValueGenerator;
};

export const withSharepointResourceNameFieldValidationApiTests = <
  RequestBodyItem extends Record<SharepointResourceNameFieldName, string>,
  SharepointResourceNameFieldName extends keyof any,
>({
  fieldName,
  valueGenerator,
  validRequestBody,
  successStatusCode,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: SharepointResourceNameFieldValidationApiTestOptions<RequestBodyItem, SharepointResourceNameFieldName>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, SharepointResourceNameFieldName>({
    fieldName,
    minLength: 1,
    maxLength: 250,
    pattern: REGEX.SHAREPOINT_RESOURCE_NAME,
    generateFieldValueOfLength: (length: number) => valueGenerator.word({ length }) as RequestBodyItem[SharepointResourceNameFieldName],
    generateFieldValueThatDoesNotMatchRegex: () => '£Word' as RequestBodyItem[SharepointResourceNameFieldName],
    validRequestBody,
    successStatusCode,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });
