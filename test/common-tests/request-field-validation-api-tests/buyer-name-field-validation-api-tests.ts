import { BUYER_NAME } from '@ukef/constants';
import {
  allowedPrefixTestCases,
  allowedStringTestCases,
  allowedSubstringTestCases,
  allowedSuffixTestCases,
  disallowedPrefixTestCases,
  disallowedStringTestCases,
  disallowedSubstringTestCases,
  disallowedSuffixTestCases,
} from '@ukef-test/common-test-cases/sharepoint-folder-name-test-cases';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { prepareModifiedRequest } from '@ukef-test/support/helpers/request-field-validation-helper';

import { StringFieldValidationApiTestOptions, withStringFieldValidationApiTests } from './string-field-validation-api-tests';

type BuyerNameFieldName = 'buyerName';

interface BuyerNameFieldValidationApiTestOptions<RequestBodyItem extends { buyerName: string }>
  extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, BuyerNameFieldName>,
    'validRequestBody' | 'successStatusCode' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withBuyerNameFieldValidationApiTests = <RequestBodyItem extends { buyerName: string }>({
  valueGenerator,
  validRequestBody,
  successStatusCode,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: BuyerNameFieldValidationApiTestOptions<RequestBodyItem>): void => {
  const fieldName = 'buyerName';

  withStringFieldValidationApiTests<RequestBodyItem, BuyerNameFieldName>({
    fieldName,
    minLength: 1,
    maxLength: 250,
    generateFieldValueOfLength: (length: number) => valueGenerator.buyerName({ length }) as RequestBodyItem[BuyerNameFieldName],
    validRequestBody,
    successStatusCode,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  describe(`buyerName regex validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    const requestIsAnArray = Array.isArray(validRequestBody);
    const requestBodyItem = requestIsAnArray ? validRequestBody[0] : validRequestBody;
    const fieldNameToUpdate = fieldName.toString();

    it.each([...allowedStringTestCases, ...allowedSubstringTestCases, ...allowedPrefixTestCases, ...allowedSuffixTestCases])(
      `returns a ${successStatusCode} response if buyerName matches the regular expression ${BUYER_NAME.REGEX} ($testTitle)`,
      async ({ value }) => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameToUpdate]: value };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status } = await makeRequest(preparedRequestWithInvalidField);
        expect(status).toBe(successStatusCode);
      },
    );

    it.each([...disallowedStringTestCases, ...disallowedSubstringTestCases, ...disallowedPrefixTestCases, ...disallowedSuffixTestCases])(
      `returns a 400 response if buyerName does not match the regular expression ${BUYER_NAME.REGEX} ($testTitle)`,
      async ({ value }) => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameToUpdate]: value };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`buyerName must match ${BUYER_NAME.REGEX} regular expression`]),
          statusCode: 400,
        });
      },
    );
  });
};
