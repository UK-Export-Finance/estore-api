import { getMinAndMaxLengthFromOptions } from '@ukef-test/support/helpers/min-and-max-length-helper';
import { prepareModifiedRequest } from '@ukef-test/support/helpers/request-field-validation-helper';
import { HttpStatusCode } from 'axios';
import request from 'supertest';

export interface StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem> {
  fieldName: RequestBodyItemKey;
  length?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  enum?: any;
  generateFieldValueOfLength?: (length: number) => RequestBodyItem[RequestBodyItemKey];
  generateFieldValueThatDoesNotMatchRegex?: () => RequestBodyItem[RequestBodyItemKey];
  generateFieldValueThatDoesNotMatchEnum?: () => RequestBodyItem[RequestBodyItemKey];
  validRequestBody: RequestBodyItem[] | RequestBodyItem;
  successStatusCode: HttpStatusCode;
  makeRequest: ((body: unknown[]) => request.Test) | ((body: unknown) => request.Test);
  givenAnyRequestBodyWouldSucceed: () => void;
}

export function withStringFieldValidationApiTests<RequestBodyItem, RequestBodyItemKey extends keyof RequestBodyItem>({
  fieldName: fieldNameSymbol,
  length: lengthOption,
  minLength: minLengthOption,
  maxLength: maxLengthOption,
  required,
  pattern,
  enum: theEnum,
  generateFieldValueThatDoesNotMatchEnum,
  generateFieldValueOfLength,
  generateFieldValueThatDoesNotMatchRegex,
  validRequestBody,
  successStatusCode,
  makeRequest,
  givenAnyRequestBodyWouldSucceed,
}: StringFieldValidationApiTestOptions<RequestBodyItem, RequestBodyItemKey>): void {
  const fieldName = fieldNameSymbol.toString();
  const { minLength, maxLength } = getMinAndMaxLengthFromOptions({ parameterName: fieldName, minLengthOption, maxLengthOption, lengthOption, theEnum });
  const requestIsAnArray = Array.isArray(validRequestBody);
  const requestBodyItem = requestIsAnArray ? validRequestBody[0] : validRequestBody;

  required = required ?? true;

  describe(`${fieldName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestBodyWouldSucceed();
    });

    it(`returns a 400 response if ${fieldName} is number`, async () => {
      const requestWithNumberField = { ...requestBodyItem, [fieldNameSymbol]: 1 };
      const preparedRequestWithNumberField = prepareModifiedRequest(requestIsAnArray, requestWithNumberField);

      const { status, body } = await makeRequest(preparedRequestWithNumberField);

      expect(status).toBe(400);
      expect(body).toMatchObject({
        error: 'Bad Request',
        message: expect.arrayContaining([`${fieldName} must be a string`]),
        statusCode: 400,
      });
    });

    if (required) {
      if (theEnum && generateFieldValueThatDoesNotMatchEnum) {
        it(`returns a 400 response if ${fieldName} is not present`, async () => {
          const { [fieldNameSymbol]: _removed, ...requestWithoutTheField } = requestBodyItem;
          const preparedRequestWithoutTheField = prepareModifiedRequest(requestIsAnArray, requestWithoutTheField);

          const { status, body } = await makeRequest(preparedRequestWithoutTheField);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${fieldName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
            statusCode: 400,
          });
        });
      } else {
        it(`returns a 400 response if ${fieldName} is not present`, async () => {
          const { [fieldNameSymbol]: _removed, ...requestWithoutTheField } = requestBodyItem;

          const { status, body } = await makeRequest(prepareModifiedRequest(requestIsAnArray, requestWithoutTheField));

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
            statusCode: 400,
          });
        });
      }
    } else {
      it(`returns a ${successStatusCode} response if ${fieldName} is not present`, async () => {
        const { [fieldNameSymbol]: _removed, ...requestWithField } = requestBodyItem;
        const preparedRequestWithField = prepareModifiedRequest(requestIsAnArray, requestWithField);

        const { status } = await makeRequest(preparedRequestWithField);

        expect(status).toBe(successStatusCode);
      });
    }

    if (minLength > 0) {
      it(`returns a 400 response if ${fieldName} is an empty string`, async () => {
        const requestWithEmptyField = { ...requestBodyItem, [fieldNameSymbol]: '' };
        const preparedRequestWithEmptyField = prepareModifiedRequest(requestIsAnArray, requestWithEmptyField);

        const { status, body } = await makeRequest(preparedRequestWithEmptyField);
        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
          statusCode: 400,
        });
      });

      it(`returns a ${successStatusCode} response if ${fieldName} has ${minLength} characters`, async () => {
        const requestWithValidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(minLength) };
        const preparedRequestWithValidField = prepareModifiedRequest(requestIsAnArray, requestWithValidField);

        const { status } = await makeRequest(preparedRequestWithValidField);

        expect(status).toBe(successStatusCode);
      });

      if (minLength > 1) {
        it(`returns a 400 response if ${fieldName} has fewer than ${minLength} characters`, async () => {
          const requestWithTooShortField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(minLength - 1) };
          const preparedRequestWithTooShortField = prepareModifiedRequest(requestIsAnArray, requestWithTooShortField);

          const { status, body } = await makeRequest(preparedRequestWithTooShortField);

          expect(status).toBe(400);
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining([`${fieldName} must be longer than or equal to ${minLength} characters`]),
            statusCode: 400,
          });
        });
      }
    } else {
      if (!theEnum) {
        it(`returns a ${successStatusCode} response if ${fieldName} is an empty string`, async () => {
          const requestWithEmptyField = { ...requestBodyItem, [fieldNameSymbol]: '' };
          const preparedRequestWithEmptyField = prepareModifiedRequest(requestIsAnArray, requestWithEmptyField);
          const { status } = await makeRequest(preparedRequestWithEmptyField);

          expect(status).toBe(successStatusCode);
        });
      }
    }

    if (maxLength) {
      if (minLength !== maxLength) {
        it(`returns a ${successStatusCode} response if ${fieldName} has ${maxLength} characters`, async () => {
          const requestWithValidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(maxLength) };
          const preparedRequestWithValidField = prepareModifiedRequest(requestIsAnArray, requestWithValidField);

          const { status } = await makeRequest(preparedRequestWithValidField);

          expect(status).toBe(successStatusCode);
        });
      }

      it(`returns a 400 response if ${fieldName} has more than ${maxLength} characters`, async () => {
        const requestWithTooLongField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(maxLength + 1) };
        const preparedRequestWithTooLongField = prepareModifiedRequest(requestIsAnArray, requestWithTooLongField);

        const { status, body } = await makeRequest(preparedRequestWithTooLongField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be shorter than or equal to ${maxLength} characters`]),
          statusCode: 400,
        });
      });
    } else {
      it(`returns a ${successStatusCode} response if ${fieldName} has 1000 characters`, async () => {
        const requestWith1000CharacterField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueOfLength(1000) };
        const preparedRequestWith1000CharacterField = prepareModifiedRequest(requestIsAnArray, requestWith1000CharacterField);

        const { status } = await makeRequest(preparedRequestWith1000CharacterField);

        expect(status).toBe(successStatusCode);
      });
    }

    if (pattern && generateFieldValueThatDoesNotMatchRegex) {
      it(`returns a 400 response if ${fieldName} does not match the regular expression ${pattern}`, async () => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueThatDoesNotMatchRegex() };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must match ${pattern} regular expression`]),
          statusCode: 400,
        });
      });
    }

    if (theEnum && generateFieldValueThatDoesNotMatchEnum) {
      it(`returns a 400 response if ${fieldName} does not match the enum`, async () => {
        const requestWithInvalidField = { ...requestBodyItem, [fieldNameSymbol]: generateFieldValueThatDoesNotMatchEnum() };
        const preparedRequestWithInvalidField = prepareModifiedRequest(requestIsAnArray, requestWithInvalidField);

        const { status, body } = await makeRequest(preparedRequestWithInvalidField);

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${fieldName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
          statusCode: 400,
        });
      });
    }
  });
}
