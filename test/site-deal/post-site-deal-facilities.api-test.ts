import { Api } from '@ukef-test/support/api';
import { ENVIRONMENT_VARIABLES } from '@ukef-test/support/environment-variables';
import { CreateFacilityFolderGenerator } from '@ukef-test/support/generator/create-facility-folder-generator';
import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import { MockGraphClientService } from '@ukef-test/support/mocks/graph-client.service.mock';
import { resetAllWhenMocks } from 'jest-when';
import nock from 'nock';

describe('Create Site Deal Facility Folder', () => {
  const valueGenerator = new RandomValueGenerator();
  const {
    createFacilityFolderParamsDto,
    createFacilityFolderRequestDto,
    createFacilityFolderResponseDto,
    tfisFacilityHiddenListTermStoreFacilityTermDataRequest,
    tfisFacilityHiddenListTermStoreFacilityTermDataResponse,
    tfisFacilityListParentFolderRequest,
    tfisFacilityListParentFolderResponse,
    custodianCreateAndProvisionRequest,
  } = new CreateFacilityFolderGenerator(valueGenerator).generate({
    numberToGenerate: 1,
  });

  let api: Api;
  let mockGraphClientService: MockGraphClientService;

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

  afterEach(() => {
    nock.abortPendingRequests();
    nock.cleanAll();
  });

  it('returns the name of the folder created with status code 201 when successful', async () => {
    mockSuccessfulGraphGetTfisFacilityListItems();
    mockSuccessfulGraphGetTfisFacilityHiddenListTermStoreItems();
    mockSuccessfulCreateAndProvision();

    const { status, body } = await makeRequest();

    expect(status).toBe(201);
    expect(body).toEqual(createFacilityFolderResponseDto);
  });

  //   it('makes a list item query to scSharepointUrl with the expected parameters', () => {});

  //   it('makes a list item query to tfisSharepointUrl with the expected parameters', () => {});

  //   it('returns a 400 if the list item query to scSharepointUrl returns an empty value list', () => {});

  //   it('returns a 500 if the list item query to scSharepointUrl returns an empty id value', () => {});

  //   it('returns a 400 if the list item query to tfisSharepointUrl returns an empty value list', () => {});

  //   it('returns a 500 if the list item query to tfisSharepointUrl returns an empty facilityGUID value', () => {});

  //   it('returns a 500 if the folder creation fails', () => {});

  const mockSuccessfulGraphGetTfisFacilityHiddenListTermStoreItems = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityHiddenListTermStoreFacilityTermDataRequest.filter)
      .mockSuccessfulGraphGetCall(tfisFacilityHiddenListTermStoreFacilityTermDataResponse);
  };

  const mockSuccessfulGraphGetTfisFacilityListItems = () => {
    mockGraphClientService
      .mockSuccessfulGraphApiCallWithPath(tfisFacilityListParentFolderRequest.path)
      .mockSuccessfulExpandCallWithExpandString(tfisFacilityListParentFolderRequest.expand)
      .mockSuccessfulFilterCallWithFilterString(tfisFacilityListParentFolderRequest.filter)
      .mockSuccessfulGraphGetCall(tfisFacilityListParentFolderResponse);
  };

  const mockSuccessfulCreateAndProvision = () => {
    mockSuccessfulCreateAndProvisionWithBody(JSON.stringify(custodianCreateAndProvisionRequest));
  };

  const mockSuccessfulCreateAndProvisionWithBody = (requestBody: nock.RequestBodyMatcher) => {
    nock(ENVIRONMENT_VARIABLES.CUSTODIAN_BASE_URL)
      .post('/Create/CreateAndProvision', requestBody)
      .matchHeader('Content-Type', 'application/json')
      .reply(201, 'TODO apim-139');
  };

  const makeRequest = async () => {
    return await api.post(
      `/api/v1/sites/${createFacilityFolderParamsDto.siteId}/deals/${createFacilityFolderParamsDto.dealId}/facilities`,
      createFacilityFolderRequestDto,
    );
  };
});
