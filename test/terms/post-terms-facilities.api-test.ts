import { GraphError } from '@microsoft/microsoft-graph-client';
import { UKEFID } from '@ukef/constants';
import { CreateTermForFacilityResponseEnum } from '@ukef/constants/enums/create-term-for-facility-response';
import { UkefId } from '@ukef/helpers';
import { IncorrectAuthArg, withClientAuthenticationTests } from '@ukef-test/common-tests/client-authentication-api-tests';
import { withStringFieldValidationApiTests } from '@ukef-test/common-tests/request-field-validation-api-tests/string-field-validation-api-tests';
import { withSharedGraphExceptionHandlingTests } from '@ukef-test/common-tests/shared-graph-exception-handling-api-tests';
import { Api } from '@ukef-test/support/api';
import { CreateTermFacilityGenerator } from '@ukef-test/support/generator/create-term-facility-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';

describe('postFacilityToTermStore', () => {
  const valueGenerator = new RandomValueGenerator();

  let api: Api;
  let mockGraphClientService: MockGraphClientService;

  const postTermsFacilitiesUrl = '/api/v1/terms/facilities';

  const { createTermFacilityRequest, createTermFacilityResponse, graphServicePostParams } = new CreateTermFacilityGenerator(valueGenerator).generate({
    numberToGenerate: 1,
  });

  beforeAll(async () => {
    ({ api, mockGraphClientService } = await Api.create());
  });

  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterAll(async () => {
    await api.destroy();
  });

  withClientAuthenticationTests({
    givenTheRequestWouldOtherwiseSucceed: () => {
      mockGraphClientService
        .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
        .mockSuccessfulGraphPostCallWithRequestBody(graphServicePostParams[0].requestBody);
    },
    makeRequestWithoutAuth: (incorrectAuth?: IncorrectAuthArg) =>
      api.postWithoutAuth(postTermsFacilitiesUrl, createTermFacilityRequest[0], incorrectAuth?.headerName, incorrectAuth?.headerValue),
  });

  withSharedGraphExceptionHandlingTests({
    givenRequestWouldOtherwiseSucceed: () => {},
    givenGraphServiceCallWillThrowError: (error: Error) => {
      mockGraphClientService.mockSuccessfulGraphApiCallWithPath(graphServicePostParams.path).mockUnsuccessfulGraphGetCall(error);
    },
    makeRequest: () => api.post(postTermsFacilitiesUrl, createTermFacilityRequest[0]),
  });

  it('creates new term for facility and returns 201', async () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
      .mockSuccessfulGraphPostCallWithRequestBody(graphServicePostParams[0].requestBody);

    const { status, body } = await api.post(postTermsFacilitiesUrl, createTermFacilityRequest[0]);
    expect(status).toBe(201);
    expect(body).toStrictEqual(createTermFacilityResponse[0]);
  });

  it('returns term exist message and status 200', async () => {
    const graphError = new GraphError(400, 'One or more fields with unique constraints already has the provided value.');
    graphError.code = 'invalidRequest';
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path)
      .mockUnsuccessfulGraphPostCallWithRequestBody(graphServicePostParams[0].requestBody, graphError);

    const { status, body } = await api.post(postTermsFacilitiesUrl, createTermFacilityRequest[0]);
    expect(status).toBe(200);
    expect(body).toStrictEqual({ message: CreateTermForFacilityResponseEnum.FACILITY_TERMS_EXISTS });
  });

  describe('field validation', () => {
    const makeRequest = (body: unknown[]) => api.post(postTermsFacilitiesUrl, body);

    const givenAnyRequestBodyWouldSucceed = () => {
      mockGraphClientService.mockSuccessfulGraphApiCallWithPath(graphServicePostParams[0].path).mockSuccessfulGraphPostCallWithRequestBody(expect.anything());
    };

    withStringFieldValidationApiTests({
      fieldName: 'id',
      length: 10,
      pattern: UKEFID.MAIN_ID.TEN_DIGIT_REGEX,
      generateFieldValueOfLength: (length: number) => valueGenerator.ukefId(length - 4),
      generateFieldValueThatDoesNotMatchRegex: () => '1000000000' as UkefId,
      validRequestBody: createTermFacilityRequest[0],
      successStatusCode: 201,
      makeRequest,
      givenAnyRequestBodyWouldSucceed,
    });
  });

  it('returns a 400 with validation error if request is empty', async () => {
    const { status, body } = await api.post(postTermsFacilitiesUrl, '');

    expect(status).toBe(400);
    expect(body).toStrictEqual({
      error: 'Bad Request',
      message: 'Validation failed (parsable array expected)',
      statusCode: 400,
    });
  });
});
