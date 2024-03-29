import { EXPORTER_NAME } from '@ukef/constants';
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

type ExporterNameFieldName = 'exporterName';

interface ExporterNameFieldValidationApiTestOptions<RequestBodyItem extends { exporterName: string }>
  extends Pick<
    StringFieldValidationApiTestOptions<RequestBodyItem, ExporterNameFieldName>,
    'validRequestBody' | 'successStatusCode' | 'makeRequest' | 'givenAnyRequestBodyWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withExporterNameFieldValidationApiTests = <RequestBodyItem extends { exporterName: string }>({
  valueGenerator,
  validRequestBody,
  successStatusCode,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: ExporterNameFieldValidationApiTestOptions<RequestBodyItem>): void => {
  const fieldName = 'exporterName';

  withStringFieldValidationApiTests<RequestBodyItem, ExporterNameFieldName>({
    fieldName,
    minLength: 1,
    maxLength: 250,
    generateFieldValueOfLength: (length: number) => valueGenerator.exporterName({ length }) as RequestBodyItem[ExporterNameFieldName],
    validRequestBody,
    successStatusCode,
    makeRequest,
    givenAnyRequestBodyWouldSucceed,
  });

  describe(`exporterName regex validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    const requestIsAnArray = Array.isArray(validRequestBody);
    const requestBodyItem = requestIsAnArray ? validRequestBody[0] : validRequestBody;
    const fieldNameToUpdate = fieldName.toString();

    it.each([...allowedStringTestCases, ...allowedSubstringTestCases, ...allowedPrefixTestCases, ...allowedSuffixTestCases])(
      `returns a ${successStatusCode} response if exporterName matches the regular expression ${EXPORTER_NAME.REGEX} ($testTitle)`,
      async ({ value }) => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameToUpdate]: value };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status } = await makeRequest(preparedRequestWithInvalidField);
        expect(status).toBe(successStatusCode);
      },
    );

    it.each([...disallowedStringTestCases, ...disallowedSubstringTestCases, ...disallowedPrefixTestCases, ...disallowedSuffixTestCases])(
      `returns a 400 response if exporterName does not match the regular expression ${EXPORTER_NAME.REGEX} ($testTitle)`,
      async ({ value }) => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameToUpdate]: value };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`exporterName must match ${EXPORTER_NAME.REGEX} regular expression`]),
          statusCode: 400,
        });
      },
    );
  });
};
