import { getMinAndMaxLengthFromOptions } from '@ukef-test/support/helpers/min-and-max-length-helper';
import { HttpStatusCode } from 'axios';
import request from 'supertest';

export interface ParamValidationApiTestOptions {
  paramName: string;
  length?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any;
  generateParamValueOfLength?: (length: number) => string;
  generateParamValueThatDoesNotMatchRegex?: () => string;
  generateParamValueThatDoesNotMatchEnum?: () => string;
  validRequestParam: string;
  successStatusCode: HttpStatusCode;
  makeRequest: (paramValue: string) => request.Test;
  givenAnyRequestParamWouldSucceed: () => void;
}

export const withParamValidationApiTests = ({
  paramName: paramNameSymbol,
  length: lengthOption,
  minLength: minLengthOption,
  maxLength: maxLengthOption,
  pattern,
  enum: theEnum,
  generateParamValueOfLength,
  generateParamValueThatDoesNotMatchRegex,
  generateParamValueThatDoesNotMatchEnum,
  validRequestParam,
  successStatusCode,
  makeRequest,
  givenAnyRequestParamWouldSucceed,
}: ParamValidationApiTestOptions) => {
  const paramName = paramNameSymbol as string;
  const { minLength, maxLength } = getMinAndMaxLengthFromOptions({ parameterName: paramName, minLengthOption, maxLengthOption, lengthOption });

  describe(`${paramName} validation`, () => {
    beforeEach(() => {
      givenAnyRequestParamWouldSucceed();
    });

    it(`returns a ${successStatusCode} response if ${paramName} is valid`, async () => {
      const { status } = await makeRequest(validRequestParam);

      expect(status).toBe(successStatusCode);
    });

    it(`returns a ${successStatusCode} response if ${paramName} has ${minLength} characters`, async () => {
      const { status } = await makeRequest(generateParamValueOfLength(minLength));

      expect(status).toBe(successStatusCode);
    });

    if (minLength > 1) {
      it(`returns a 400 response if ${paramName} has fewer than ${minLength} characters`, async () => {
        const { status, body } = await makeRequest(generateParamValueOfLength(minLength - 1));

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${paramName} must be longer than or equal to ${minLength} characters`]),
          statusCode: 400,
        });
      });
    }

    if (minLength !== maxLength) {
      it(`returns a ${successStatusCode} response if ${paramName} has ${maxLength} characters`, async () => {
        const { status } = await makeRequest(generateParamValueOfLength(maxLength));

        expect(status).toBeGreaterThanOrEqual(200);
        expect(status).toBeLessThan(300);
      });
    }

    if (maxLength) {
      it(`returns a 400 response if ${paramName} has more than ${maxLength} characters`, async () => {
        const { status, body } = await makeRequest(generateParamValueOfLength(maxLength + 1));

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${paramName} must be shorter than or equal to ${maxLength} characters`]),
          statusCode: 400,
        });
      });
    }

    if (pattern && generateParamValueThatDoesNotMatchRegex) {
      it(`returns a 400 response if ${paramName} does not match the regular expression ${pattern}`, async () => {
        const { status, body } = await makeRequest(generateParamValueThatDoesNotMatchRegex());

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${paramName} must match ${pattern} regular expression`]),
          statusCode: 400,
        });
      });
    }

    if (theEnum && generateParamValueThatDoesNotMatchEnum) {
      it(`returns a 400 response if ${paramName} does not match the enum`, async () => {
        const { status, body } = await makeRequest(generateParamValueThatDoesNotMatchEnum());

        expect(status).toBe(400);
        expect(body).toMatchObject({
          error: 'Bad Request',
          message: expect.arrayContaining([`${paramName} must be one of the following values: ${Object.values(theEnum).join(', ')}`]),
          statusCode: 400,
        });
      });
    }
  });
};
