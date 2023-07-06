import { getMinAndMaxLengthFromOptions } from '@ukef-test/support/helpers/min-and-max-length-helper';
import { HttpStatusCode } from 'axios';
import request from 'supertest';

export interface StringQueryValidationApiTestOptions<RequestQueryItems, RequestQueryItemsKey extends keyof RequestQueryItems> {
  queryName: RequestQueryItemsKey;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  enum?: any;
  generateQueryValueOfLength?: (length: number) => RequestQueryItems[RequestQueryItemsKey];
  generateQueryValueThatDoesNotMatchRegex?: () => RequestQueryItems[RequestQueryItemsKey];
  generateQueryValueThatDoesNotMatchEnum?: () => RequestQueryItems[RequestQueryItemsKey];
  validRequestQueries: RequestQueryItems;
  successStatusCode: HttpStatusCode;
  makeRequestWithQueries: (queries: RequestQueryItems) => request.Test;
  givenAnyRequestQueryWouldSucceed: () => void;
}

export const withStringQueryValidationApiTests = <RequestQueryItems, RequestQueryItemsKey extends keyof RequestQueryItems>({
  queryName: queryNameSymbol,
  length: lengthOption,
  minLength: minLengthOption,
  maxLength: maxLengthOption,
  required,
  pattern,
  enum: theEnum,
  generateQueryValueOfLength,
  generateQueryValueThatDoesNotMatchRegex,
  generateQueryValueThatDoesNotMatchEnum,
  validRequestQueries,
  successStatusCode,
  makeRequestWithQueries,
  givenAnyRequestQueryWouldSucceed,
}: StringQueryValidationApiTestOptions<RequestQueryItems, RequestQueryItemsKey>) => {
  const queryName = queryNameSymbol as string;
  const { minLength, maxLength } = getMinAndMaxLengthFromOptions({ parameterName: queryName, minLengthOption, maxLengthOption, lengthOption });

  required = required ?? true;

  describe(`${queryName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestQueryWouldSucceed();
    });

    it(`returns a ${successStatusCode} response if the query parameter is valid`, async () => {
      const { status } = await makeRequestWithQueries(validRequestQueries);

      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(300);
    });

    it(`returns a ${successStatusCode} response if there is an unexpected query parameter`, async () => {
      const { status } = await makeRequestWithQueries({ ...validRequestQueries, unexpectedQueryParameter: 'unexpectedQueryParameterValue' });

      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(300);
    });

    if (required) {
      if (theEnum && generateQueryValueThatDoesNotMatchEnum) {
        it(`returns a 400 response if ${queryName} is not present`, async () => {
          const { [queryNameSymbol]: _removed, ...requestWithoutTheQuery } = validRequestQueries;

          const { status, body } = await makeRequestWithQueries(requestWithoutTheQuery as RequestQueryItems);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${queryName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
            statusCode: 400,
          });
        });
      } else {
        it(`returns a 400 response if ${queryName} is not present`, async () => {
          const { [queryNameSymbol]: _removed, ...requestWithoutTheQuery } = validRequestQueries;

          const { status, body } = await makeRequestWithQueries(requestWithoutTheQuery as RequestQueryItems);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${queryName} must be longer than or equal to ${minLength} characters`]),
            statusCode: 400,
          });
        });
      }
    }

    if (minLength > 0) {
      it(`returns a 400 response if ${queryName} is an empty string`, async () => {
        const requestWithEmptyQuery = { ...validRequestQueries, [queryNameSymbol]: '' };

        const { status, body } = await makeRequestWithQueries(requestWithEmptyQuery);
        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${queryName} must be longer than or equal to ${minLength} characters`]),
          statusCode: 400,
        });
      });

      it(`returns a ${successStatusCode} response if ${queryName} has ${minLength} characters`, async () => {
        const requestWithValidQuery = { ...validRequestQueries, [queryNameSymbol]: generateQueryValueOfLength(minLength) };

        const { status } = await makeRequestWithQueries(requestWithValidQuery);

        expect(status).toBe(successStatusCode);
      });

      if (minLength > 1) {
        it(`returns a 400 response if ${queryName} has fewer than ${minLength} characters`, async () => {
          const requestWithTooShortQuery = { ...validRequestQueries, [queryNameSymbol]: generateQueryValueOfLength(minLength - 1) };

          const { status, body } = await makeRequestWithQueries(requestWithTooShortQuery);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${queryName} must be longer than or equal to ${minLength} characters`]),
            statusCode: 400,
          });
        });
      }
    } else {
      if (!theEnum) {
        it(`returns a ${successStatusCode} response if ${queryName} is an empty string`, async () => {
          const requestWithEmptyQuery = { ...validRequestQueries, [queryNameSymbol]: '' };
          const { status } = await makeRequestWithQueries(requestWithEmptyQuery);

          expect(status).toBeGreaterThanOrEqual(200);
          expect(status).toBeLessThan(300);
        });
      }
    }

    if (minLength !== maxLength) {
      it(`returns a ${successStatusCode} response if ${queryName} has ${maxLength} characters`, async () => {
        const requestWithValidQuery = { ...validRequestQueries, [queryNameSymbol]: generateQueryValueOfLength(maxLength) };

        const { status } = await makeRequestWithQueries(requestWithValidQuery);

        expect(status).toBe(successStatusCode);
      });
    }

    if (maxLength) {
      it(`returns a 400 response if ${queryName} has more than ${maxLength} characters`, async () => {
        const requestWithTooLongQuery = { ...validRequestQueries, [queryNameSymbol]: generateQueryValueOfLength(maxLength + 1) };
        const { status, body } = await makeRequestWithQueries(requestWithTooLongQuery);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${queryName} must be shorter than or equal to ${maxLength} characters`]),
          statusCode: 400,
        });
      });
    }

    if (pattern && generateQueryValueThatDoesNotMatchRegex) {
      it(`returns a 400 response if ${queryName} does not match the regular expression ${pattern}`, async () => {
        const requestWithInvalidQuery = { ...validRequestQueries, [queryNameSymbol]: generateQueryValueThatDoesNotMatchRegex() };

        const { status, body } = await makeRequestWithQueries(requestWithInvalidQuery);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${queryName} must match ${pattern} regular expression`]),
          statusCode: 400,
        });
      });
    }

    if (theEnum && generateQueryValueThatDoesNotMatchEnum) {
      it(`returns a 400 response if ${queryName} does not match the enum`, async () => {
        const requestWithInvalidQuery = { ...validRequestQueries, [queryNameSymbol]: generateQueryValueThatDoesNotMatchEnum() };

        const { status, body } = await makeRequestWithQueries(requestWithInvalidQuery);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${queryName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
          statusCode: 400,
        });
      });
    }
  });
};
