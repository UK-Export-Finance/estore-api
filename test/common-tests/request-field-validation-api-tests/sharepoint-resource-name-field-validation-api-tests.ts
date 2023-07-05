import { SHAREPOINT } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

interface SharepointResourceNameFieldValidationApiTestOptions<
  RequestBodyItem extends Record<SharepointResourceNameFieldName, string>,
  SharepointResourceNameFieldName extends keyof any,
> extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, SharepointResourceNameFieldName>,
    'fieldName' | 'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withSharepointResourceNameFieldValidationApiTests = <
  RequestBodyItem extends Record<SharepointResourceNameFieldName, string>,
  SharepointResourceNameFieldName extends keyof any,
>({
  fieldName,
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: SharepointResourceNameFieldValidationApiTestOptions<RequestBodyItem, SharepointResourceNameFieldName>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, SharepointResourceNameFieldName>({
    fieldName,
    minLength: 1,
    maxLength: 250,
    required: true,
    pattern: SHAREPOINT.RESOURCE_NAME.REGEX,
    generateFieldValueOfLength: (length: number) => valueGenerator.word({ length }) as RequestBodyItem[SharepointResourceNameFieldName],
    generateFieldValueThatDoesNotMatchRegex: () => '£Word' as RequestBodyItem[SharepointResourceNameFieldName],
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });
