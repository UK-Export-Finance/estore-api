import { REGEX } from '@ukef/constants';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type DealIdentifierFieldName = 'dealIdentifier';

type DealIdentifierFieldValidationApiTestOptions<RequestBodyItem extends { dealIdentifier: string }> = Pick<
  StringFieldValidationApiTestOptions<RequestBodyItem, DealIdentifierFieldName>,
  'validRequestBody' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed' | 'successStatusCode'
> & {
  valueGenerator: RandomValueGenerator;
};

export const withDealIdentifierFieldValidationApiTests = <RequestBodyItem extends { dealIdentifier: string }>({
  valueGenerator,
  validRequestBody,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
  successStatusCode,
}: DealIdentifierFieldValidationApiTestOptions<RequestBodyItem>): void =>
  withStringFieldValidationApiTests<RequestBodyItem, DealIdentifierFieldName>({
    fieldName: 'dealIdentifier',
    length: 10,
    pattern: REGEX.UKEF_ID_TEN_DIGIT,
    generateFieldValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
    generateFieldValueThatDoesNotMatchRegex: () => '1000000000',
    validRequestBody,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
    successStatusCode,
  });
