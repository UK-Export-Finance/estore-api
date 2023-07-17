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
} from '@ukef-test/common-test-cases/exporter-name-test-cases';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import { StringQueryValidationApiTestOptions, withStringQueryValidationApiTests } from './string-query-validation-api-tests';

type ExporterNameQueryName = 'exporterName';

interface ExporterNameQueryValidationApiTestOptions<RequestBodyItem extends { exporterName: string }>
  extends Pick<
    StringQueryValidationApiTestOptions<RequestBodyItem, ExporterNameQueryName>,
    'validRequestQueries' | 'successStatusCode' | 'makeRequestWithQueries' | 'givenAnyRequestQueryWouldSucceed'
  > {
  valueGenerator: RandomValueGenerator;
}

export const withExporterNameQueryValidationApiTests = <RequestQueryItems extends Record<ExporterNameQueryName, string>>({
  valueGenerator,
  validRequestQueries,
  successStatusCode,
  makeRequestWithQueries,
  givenAnyRequestQueryWouldSucceed,
}: ExporterNameQueryValidationApiTestOptions<RequestQueryItems>): void => {
  const queryName = 'exporterName';

  withStringQueryValidationApiTests<RequestQueryItems, ExporterNameQueryName>({
    queryName,
    minLength: 1,
    maxLength: 250,
    generateQueryValueOfLength: (length: number) => valueGenerator.exporterName({ length }) as RequestQueryItems[ExporterNameQueryName],
    validRequestQueries,
    successStatusCode,
    makeRequestWithQueries,
    givenAnyRequestQueryWouldSucceed,
  });

  describe(`exporterName regex validation`, () => {
    beforeEach(() => {
      givenAnyRequestQueryWouldSucceed();
    });

    it.each([...allowedStringTestCases, ...allowedSubstringTestCases, ...allowedPrefixTestCases, ...allowedSuffixTestCases])(
      `returns a ${successStatusCode} response if exporterName matchs the regular expression ${EXPORTER_NAME.REGEX} ($testTitle)`,
      async ({ value }) => {
        const requestWithInvalidQuery = { ...validRequestQueries, [queryName]: value };

        const { status } = await makeRequestWithQueries(requestWithInvalidQuery);

        expect(status).toBe(successStatusCode);
      },
    );

    it.each([...disallowedStringTestCases, ...disallowedSubstringTestCases, ...disallowedPrefixTestCases, ...disallowedSuffixTestCases])(
      `returns a 400 response if exporterName does not match the regular expression ${EXPORTER_NAME.REGEX} ($testTitle)`,
      async ({ value }) => {
        const requestWithInvalidQuery = { ...validRequestQueries, [queryName]: value };

        const { status, body } = await makeRequestWithQueries(requestWithInvalidQuery);

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
